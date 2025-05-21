package qwerty.chaekit.global.init.dummy;

import lombok.Getter;

@Getter
public enum DummyEbook {
    ALICE("이상한 나라의 앨리스", "루이스 캐럴", 
                    """
                    논리와 현실이 무너진 세계, 앨리스는 토끼를 따라 기이한 모험에 빠진다.
                    유쾌하고도 철학적인 상상력이 가득한 고전 판타지.
                    """,
            "ebook/sample-alice.epub", 
            "ebook-cover-image/cover-alice.jpg", 1914953, 0
    ),
    ROMEO_AND_JULIET("로미오와 줄리엣", "윌리엄 셰익스피어",
            """
                    사랑은 가장 순수하지만, 세상은 가장 잔혹하다.
                    비극적인 운명 속에서 피어난 젊은 연인의 이야기.
                    """,
            "ebook/sample-romeo.epub",
            "ebook-cover-image/cover-romeo.jpg", 227349, 0
    ),
    MOBY_D("모비딕", "허먼 멜빌",
            """
                    흰 고래를 쫓는 집착의 항해, 그 끝은 어디인가?
                    인간과 자연, 운명에 대한 묵직한 질문을 던지는 대서사시.
                    """,
            "ebook/sample-moby-dick.epub",
            "ebook-cover-image/cover-moby-dick.jpg", 628084, 0
    ),
            
    CINDERELLA("신데렐라", "작가 미상",
            """
                    유리 구두와 호박 마차, 그리고 꿈을 이룬 평범한 소녀.
                    시대를 초월해 사랑받는 대표적인 동화.
                    """,
            "ebook/sample-cinderella.epub",
            "ebook-cover-image/cover-cinderella.jpg", 140789, 0
    ),
    FRANKENSTEIN("프랑켄슈타인", "메리 셸리",
            """
                    인간은 어디까지 창조할 수 있는가?
                    과학과 윤리, 외로움과 책임이 교차하는 고딕 SF의 원형.
                    """,
            "ebook/sample-frankenstein.epub",
            "ebook-cover-image/cover-frankenstein.jpg", 293483, 0
            
    ),;
    
    DummyEbook(
            String title, 
            String author, 
            String description,
            String fileKey,
            String coverImageKey,
            long size,
            int price
    
    ) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.fileKey = fileKey;
        this.coverImageKey = coverImageKey;
        this.size = size;
        this.price = price;
    }
    
    private final String title;
    private final String author;
    private final String description;
    private final String fileKey;
    private final String coverImageKey;
    private final long size;
    private final int price;
}
