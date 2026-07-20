/** @jsxImportSource solid-js */

import RoundedIcon from "../ui/RoundedIcon";

const SocialMediaSection = () => {
    return (
        <div class="socmed-container w-90 mt-10">
            {/* Floating Bar */}
            <div class="floating-bar h-1.5 w-full lg:h-full lg:w-1.5 rounded-sm bg-(--text-color-two)"/>

            {/* Socmed Links Horizontal */}
            <div class="w-65 mx-auto mt-5 flex flex-row content-center justify-between">
                <RoundedIcon assetName="github" class="lg:mb-2"/>
                <RoundedIcon assetName="upwork" class="lg:mb-2"/>
                <RoundedIcon assetName="x-com" class="lg:mb-2"/>
            </div>
        </div>
    )
}

export default SocialMediaSection;