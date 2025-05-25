package qwerty.chaekit.global.init.dummy;

import lombok.Getter;

import java.util.List;

@Getter
public enum DummyGroup {
    CLASSIC(
            "클래식은 살아있다",
            """
                "모두가 알고 있다고 생각하지만, 제대로 읽은 사람은 많지 않은 이야기들."
    
                《로미오와 줄리엣》의 비극은 왜 오해와 조급함으로 가득했을까?
                《이상한 나라의 앨리스》가 품은 무의식의 세계는 어떤 모습일까?
                《프랑켄슈타인》의 괴물은 정말 괴물일까?
    
                우리는 누구나 제목은 알지만, 온전히 읽지 않았던 고전들을 다시 펼칩니다.
                모임은 각 책의 배경, 작가의 삶, 시대적 맥락을 곁들여, 단순한 줄거리 이상의 것을 나누는 시간을 지향합니다.
    
                함께 읽고, 해석하고, 질문하면서
                고전의 "그 너머"를 함께 탐험해요.
                """,
            "group-image/group-classic.png",
            List.of("소설", "고전", "원작")
            );
    
    DummyGroup(
            String name, 
            String description,
            String groupImageKey,
            List<String> tags
    ) {
        this.name = name;
        this.description = description;
        this.groupImageKey = groupImageKey;
        this.tags = tags;
    }
    
    private final String name;
    private final String description;
    private final String groupImageKey;
    private final List<String> tags;
}
