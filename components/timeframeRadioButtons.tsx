import React from "react";

import {
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from "@chakra-ui/radio";
import { Box } from "@chakra-ui/react";

import { TimeFrame } from "../interface/casino";
import SidebarStyles from "../styles/Sidebar.module.scss";

export type TimeframeRadioButtonsProps = {
  value: TimeFrame
  update: (t: TimeFrame) => void
}

export const TimeframeRadioButtons: React.FC<TimeframeRadioButtonsProps> = (props) => {
  const options = Object.values(TimeFrame);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "timeframe",
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
