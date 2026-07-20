/** @jsxImportSource solid-js */

import { Dynamic } from "solid-js/web"; 
import {
  DiagonalArrowIcon,
  EmailIcon,
  GithubIcon,
  PhoneIcon,
  StarIcon,
  UpworkIcon,
  XSocialMedia
} from "./Icons";

interface attribute_type {
  className?: string;
  fill?: string;
}

interface prop_type {
  assetName: string;
  attribute: attribute_type;
}

// Return Null Function
const returnNull = () => null;

// Component Switcher
const options = (assetName: string, attribute: any) => {
  // Attribute Call
  const attributeValue = attribute();

  // Switch Icons Components
  const components = {
    "diagonal-arrow": DiagonalArrowIcon,
    "email": EmailIcon,
    "phone": PhoneIcon,
    "star": StarIcon,
    "x-com": XSocialMedia,
    "upwork": UpworkIcon,
    "github": GithubIcon
  }

  return (components as any)[assetName](attributeValue?.className ?? "w-7", attributeValue?.fill ?? "#000000");
}

const Assets = (props: any) => {
  //Destructure a Props
  const prop_value: prop_type = {
    assetName: props.assetName,
    attribute: props?.attribute ?? returnNull // Null Handler
  }

  return (
      <>
        <Dynamic component={() => options(prop_value.assetName, prop_value.attribute)} />
      </>
  )
}

export default Assets;
