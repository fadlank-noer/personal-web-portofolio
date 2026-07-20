/** @jsxImportSource solid-js */

import { Dynamic } from "solid-js/web";
import Accesories_1 from "../accessories/Accesories_1";
import Accesories_2 from "../accessories/Accesories_2";
import Accesories_3 from "../accessories/Accesories_3";
import Accesories_4 from "../accessories/Accesories_4";
import Accesories_5 from "../accessories/Accesories_5";
import FarLeftSemicircle from "../accessories/FarLeftSemicircle";

const Accesories = (props: any) => {
    // Get Index Props
    const index = (props.assetNumber) - 1

    // List Accesories
    const indexed_accesories = [Accesories_1, Accesories_2, Accesories_3, Accesories_4, Accesories_5, FarLeftSemicircle]

    return (
        <>
            <Dynamic component={() => indexed_accesories[index]()} />
        </>
    )
}

export default Accesories;