import React from "react";

import { CUIAutoComplete } from "chakra-ui-autocomplete";

import { Casino } from "../interface/casino";
import SidebarStyles from "../styles/Sidebar.module.scss";

type SearchProps = {
  casinos: Casino[]
  onSelect: (casino: Casino) => void
}

export const Search: React.FC<SearchProps> = (props) => {
  return (
    <CUIAutoComplete
      label={"Search"}
      placeholder={"Search for a location..."}
      items={props.casinos.map(c => ({value: c.uniqueId.toString(), label: c.name + ", " + c.city + ", " + c.state}))}
      disableCreateItem={true}
      hideToggleButton={true}
      inputStyleProps={{className: SidebarStyles.searchInput}}
      listStyleProps={{className: SidebarStyles.searchDropdown}}
      selectedItems={[]}
      optionFilterFunc={((items, inputValue) => {
        if (!inputValue) return items;
        return items.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 6);
      })}
      onSelectedItemsChange={(s) => {
        const clicked = props.casinos.find(c => c.uniqueId.toString() === s.selectedItems?.[0]?.value)
        if (clicked) props.onSelect(clicked);
      }}
    />
  );
}
