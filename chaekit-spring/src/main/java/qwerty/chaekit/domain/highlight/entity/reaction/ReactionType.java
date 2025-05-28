package qwerty.chaekit.domain.highlight.entity.reaction;

public enum ReactionType{
    GREAT("👍"),
    HEART("❤️"),
    SMILE("😊"),
    CLAP("👏"),
    SAD("😢"),
    ANGRY("😠"),
    SURPRISED("😲");

    private final String emoji;

    ReactionType(String emoji){
        this.emoji = emoji;
    }

    public String getEmoji(){
        return emoji;
    }
}