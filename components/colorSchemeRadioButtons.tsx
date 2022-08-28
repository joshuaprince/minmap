import React from "react";
import { useRadio, useRadioGroup, UseRadioProps } from "@chakra-ui/radio";
import { Box } from "@chakra-ui/react";

import SidebarStyles from "../styles/Sidebar.module.scss";

export enum ColorScheme {
  CHIP_COLOR = "Chip Color",
  GRADIENT = "Low-High Gradient",
}

export type ColorSchemeButtonsProps = {
  value: ColorScheme
  update: (t: ColorScheme) => void
}

export const ColorSchemeRadioButtons: React.FC<ColorSchemeButtonsProps> = (props) => {
  const options = Object.values(ColorScheme);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "color_scheme",
    value: props.value,
    onChange: props.update,
  })

  const group = getRootProps()

  return (
    <div className={SidebarStyles.timeframeButton} {...group}>
      {options.map((value) => {
        const radio = getRadioProps({ value })
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        )
      })}
    </div>
  )
}

/* TODO: could be deduped with TimeFrame */
const RadioCard: React.FC<React.PropsWithChildren<UseRadioProps>> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}
