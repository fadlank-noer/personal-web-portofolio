/** @jsxImportSource solid-js */

import PhotoSection from "./sections/PhotoSection";
import TextAndButtonSection from "./sections/TextAndButtonSection";
import SocialMediaSection from "./sections/SocialMediaSection";

const HeroLayer = () => {
    return (
        <div id="anchor-hero" class="w-screen min-h-screen bg-(--primary-color) text-(--text-color-one) overflow-x-hidden overflow-y-hidden pb-7 text-2xl md:text-4xl">
            {/* Main Container */}
            <div class="container mx-auto w-full h-full flex flex-col lg:flex-row items-center justify-center px-4 md:px-8 py-8">
                
                {/* Photo Comes First */}
                <PhotoSection />

                {/* Text and Social Media Container */}
                <div class="flex flex-col items-center justify-center w-full lg:w-auto">
                
                {/* Text And Button CV */}
                <TextAndButtonSection />

                {/* Social Media */}
                <SocialMediaSection />
                
                </div>
                
            </div>
        </div>
    )
}

export default HeroLayer