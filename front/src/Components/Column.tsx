import { FC, useMemo } from "react";
import * as _ from "radash";
import Droppable from "../Primitives/Droppable";
import DraggableElement from "./DraggableElement";

export interface IElement {
  id: string;
  content: string;
  column: string;
}

interface IColumn {
    heading: string;
    columnsColor: string;
    elements: IElement[];
}
const Column: FC<IColumn> = ({ heading, elements, columnsColor }) => {
    const columnIdentifier = useMemo(() => _.camel(heading), [heading]);

    const amounts = useMemo(
        () => elements.filter((elm) => elm.column === columnIdentifier).length,
        [elements, columnIdentifier]
    );

    return (
        <div className="column">
            <div className="column__header">
                <div style={{ "backgroundColor": columnsColor }} className="column__header__colors"></div>
                <h3>{ heading }</h3>
                <span>({amounts})</span>
            </div>
            <Droppable id={columnIdentifier}>
                {elements.map((elm, elmIndex) => (
                <DraggableElement
                    key={`draggable-element-${elmIndex}-${columnIdentifier}`}
                    identifier={elm.id}
                    content={elm.content}
                />
                ))}
            </Droppable>
        </div>
    );
};

export default Column;