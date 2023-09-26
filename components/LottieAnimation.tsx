import React from 'react';
import Lottie from 'react-lottie';

type LottieAnimationProps = {
    animationData: any;
}

const LottieAnimation = ({ animationData }: LottieAnimationProps) => {
        const defaultOptions = {
                loop: true,
                autoplay: true,
                animationData: animationData,
        };

        return <Lottie options={defaultOptions} />;
};

export default LottieAnimation;