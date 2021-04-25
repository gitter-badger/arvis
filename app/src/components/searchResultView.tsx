/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import SearchResultItem from './searchResultItem';

type IProps = {
  searchResult: any[];
  selectedItemIdx: number;
  startIdx: number;
  maxItemCount: number;
};

const Divider = styled.div`
  width: 100%;
  border: 1px;
  border-color: #000000;
`;

const OuterContainer = styled.div`
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const InnerContainer = styled.div`
  flex-direction: column;
  width: 100%;
`;

const searchResultView = (props: IProps) => {
  const resultToRenders = useMemo(
    () =>
      props.searchResult.slice(
        props.startIdx,
        props.startIdx + props.maxItemCount
      ),
    [props]
  );

  return (
    <OuterContainer>
      {resultToRenders.map((command, index: number) => {
        return (
          <InnerContainer key={`item-${index}`}>
            <SearchResultItem
              selected={props.startIdx + index === props.selectedItemIdx}
              title={command.title ? command.title : command.command}
              subtitle={command.subtitle}
              arg={command.arg}
              text={command.text}
              autocomplete={command.autocomplete}
              variables={command.variables}
            />
            <Divider />
          </InnerContainer>
        );
      })}
    </OuterContainer>
  );
};

export default searchResultView;
