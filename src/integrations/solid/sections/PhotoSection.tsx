/** @jsxImportSource solid-js */

import Accesories from "../ui/Accesories";
import halfBody from "../../../assets/half-body.png";

const PhotoSection = () => {
    return (
        <div class="img-container flex items-center justify-center w-full h-full">
            <div class="flex-container relative flex flex-col items-center justify-center w-full min-h-0">        
                {/* Accesories */}
                <Accesories assetNumber={1} />
                <Accesories assetNumber={2} />
                <Accesories assetNumber={3} />
                <Accesories assetNumber={4} />
                <Accesories assetNumber={5} />
                
                {/* Image Section */}
                <img src={halfBody.src} class="z-2 relative w-3/4 max-w-xs md:max-w-sm lg:max-w-md mx-auto block" alt="Foto Profil" />
            </div>
        </div>
    )
}

export default PhotoSection;