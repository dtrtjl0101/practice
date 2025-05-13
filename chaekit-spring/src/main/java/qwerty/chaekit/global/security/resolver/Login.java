package qwerty.chaekit.global.security.resolver;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 메서드의 파라미터에 사용하여 로그인된 사용자 정보를 주입받을 수 있도록 하는 어노테이션입니다.
 * <p>
 * 이 어노테이션은 {@link LoginArgumentResolver}에 의해 처리됩니다.
 * <p>
 * 파라미터 타입에 따라 {@code UserToken} 또는 {@code PublisherToken} 객체를 주입받을 수 있습니다.
 * <ul>
 *     <li>{@code UserToken}: 일반 사용자 정보</li>
 *     <li>{@code PublisherToken}: 퍼블리셔 정보</li>
 * </ul>
 * <p>
 * <b>required 옵션</b>: 
 * <ul>
 *     <li>{@code true} (기본값): 인증되지 않은 요청에 대해 예외를 발생시킵니다.</li>
 *     <li>{@code false}: 인증되지 않은 요청에 대해 {@code anonymous} 객체를 반환합니다.</li>
 * </ul>
 * 
 * @see LoginArgumentResolver
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Login {

    /**
     * 로그인 정보가 필수인지 여부를 설정합니다.
     * <p>
     * 기본값은 {@code true}이며, 필수로 설정된 경우 인증되지 않은 요청은 예외를 발생시킵니다.
     *
     * @return 로그인 정보가 필수인지 여부
     */
    boolean required() default true;
}

