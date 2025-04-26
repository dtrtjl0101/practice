package qwerty.chaekit.domain.group;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.tag.GroupTag;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "reading_group")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReadingGroup extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_leader_id", nullable = false)
    private UserProfile groupLeader;

    @OneToMany(mappedBy = "readingGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupTag> tags = new ArrayList<>();

    @Column(nullable = false)
    private String description;

    @OneToMany(mappedBy = "readingGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<GroupMember> groupMembers = new ArrayList<>();

    public void addTag(String tagName) {
        GroupTag groupTag = new GroupTag(this, tagName);
        tags.add(groupTag);
    }

    public void removeTag(String tagName) {
        tags.removeIf(tag -> tag.getTagName().equals(tagName));
    }

    public List<UserProfile> getMembers() {
        return groupMembers.stream().map(GroupMember::getMember).toList();
    }

    public GroupMember addMember(UserProfile user) {
        GroupMember groupMember = new GroupMember(this, user);
        groupMembers.add(groupMember);
        return groupMember;
    }

    public GroupMember approveMember(UserProfile user){
        return groupMembers.stream()
                .filter(groupMember -> groupMember.getMember().equals(user))
                .findFirst()
                .map(groupMember -> {groupMember.approve(); return groupMember;})
                .orElse(null);
    }

    public void removeMember(UserProfile user) {
        groupMembers.removeIf(member -> member.getMember().getId().equals(user.getId()));
    }

    public void rejectMember(UserProfile user) {
        groupMembers.stream()
                .filter(member -> member.getMember().getId().equals(user.getId()))
                .findFirst()
                .ifPresent(GroupMember::reject);
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public boolean isMember(UserProfile userProfile) {
        return groupMembers.stream()
                .anyMatch(member -> member.getMember().getId().equals(userProfile.getId()));
    }

    @Builder
    public ReadingGroup(Long id, String name, UserProfile groupLeader, List<GroupTag> tags, String description) {
        this.id = id;
        this.name = name;
        this.groupLeader = groupLeader;
        this.tags = (tags != null) ? new ArrayList<>(tags) : new ArrayList<>();
        this.description = description;
    }
}
