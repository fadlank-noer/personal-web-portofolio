/** @jsxImportSource solid-js */

import Assets from "./Assets";
import RoundedIcon from "./RoundedIcon";

const ContactMe = () => {
    return (
        <div style={{"font-size": "1.5rem"}} class="hero-contact w-[100%] mx-auto flex flex-col lg:flex-row text-sm justify-between">

            <div class="phone-container flex-1 flex my-5 items-center">
              <div class="w-15 bg-(--text-color-two) flex items-center justify-center mr-3 rounded-full">
                <RoundedIcon assetName="phone" class="w-4 h-4"/>
              </div>
              <a class="hover:underline ml-2" href="https://api.whatsapp.com/send?phone=62895352837926&text=Hai%20Dlan%2C%20Aku%20datang%20dari%20Website-Mu!">Contact me By Whatsapp!</a>
            </div>

            <div class="email-container flex-1 flex items-center">
              <div class="w-15 bg-(--text-color-two) flex items-center justify-center mr-3 rounded-full">
                <RoundedIcon assetName="email" class="w-4 h-4"/>
              </div>
              <a class="hover:underline ml-2" href="mailto:fadlank.noer@gmail.com">Contact me By Email!</a>
            </div>

          {/* Close hero-contact */}
        </div>
    )
}

export default ContactMe;
