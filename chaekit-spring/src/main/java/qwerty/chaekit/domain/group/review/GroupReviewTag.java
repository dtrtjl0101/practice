package qwerty.chaekit.domain.group.review;

import lombok.Getter;

@Getter
public enum GroupReviewTag {

    // 🌟 모임 분위기
    FUNNY("😀", "유쾌하고 웃음이 많아요", Category.MOOD),
    CALM("🧘", "차분하고 편안해요", Category.MOOD),
    PASSIONATE("🔥", "열정이 느껴졌어요", Category.MOOD),
    HEARTWARMING("🥰", "따뜻한 모임이었어요", Category.MOOD),

    // 💬 대화 흐름
    DEEP_THOUGHT("🤔", "생각이 깊어졌어요", Category.FLOW),
    INSIGHTFUL("🧠", "지식이 쌓였어요", Category.FLOW),
    DIVERSE_OPINIONS("🎭", "다양한 의견을 만났어요", Category.FLOW),
    TALKATIVE("🎙️", "대화가 활발해요", Category.FLOW),
    GOOD_LISTENERS("👂", "잘 들어주는 분들이 많아요", Category.FLOW),

    // 🛠 운영 방식
    STRUCTURED("📌", "주제가 명확해요", Category.OPERATION),
    CASUAL("🌀", "자유롭게 흘러가는 느낌이에요", Category.OPERATION),
    WELL_MODERATED("🧭", "진행자가 잘 이끌어요", Category.OPERATION);

    private final String emoji;
    private final String description;
    private final Category category;

    GroupReviewTag(String emoji, String description, Category category) {
        this.emoji = emoji;
        this.description = description;
        this.category = category;
    }

    public enum Category {
        MOOD,       // 모임 분위기
        FLOW,       // 대화 흐름
        OPERATION   // 운영 방식
    }
}