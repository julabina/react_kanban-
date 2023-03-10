import { FC, useMemo, useState } from "react";
import * as _ from "radash";
import Droppable from "../Primitives/Droppable";
import DraggableElement from "./DraggableElement";
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface IElement {
  id: string;
  content: string;
  description: string;
  column: string;
  subTasks: string[];
}

interface IColumn {
    id: string;
    heading: string;
    columnsColor: string;
    elements: IElement[];
    darkMod: boolean;
}

const Column: FC<IColumn> = ({ id, heading, elements, columnsColor, darkMod }) => {
    const columnIdentifier = useMemo(() => _.camel(id), [id]);   
    console.log(elements);     

    const amounts = useMemo(
        () => elements.filter((elm) => elm.column === columnIdentifier).length,
        [elements, columnIdentifier]
    );

    const [toggleMenu, setToggleMenu] = useState<boolean>(false);

    const toggleDisplayMenu = () => {
        setToggleMenu(!toggleMenu);
    };

    return (
        <div className="column">
            <div className="column__header">
                <div className="column__header__cont">
                    <div style={{ "backgroundColor": columnsColor }} className="column__header__cont__colors"></div>
                    <h3>{ heading }</h3>
                    <span>({amounts})</span>
                </div>
                <FontAwesomeIcon onClick={toggleDisplayMenu} icon={faEllipsis} className="column__header__menuBtn" />
                {
                    toggleMenu &&
                    <nav className="column__columnMenu">
                        <p onClick={toggleDisplayMenu}>x</p>
                        <div className="column__columnMenu__separator"></div>
                        <p>Modifier</p>
                        <p>Supprimer</p>
                    </nav>
                }
            </div>
            <Droppable id={columnIdentifier}>
                {elements.map((elm, elmIndex) => (
                    <DraggableElement
                        key={`draggable-element-${elmIndex}-${columnIdentifier}`}
                        identifier={elm.id}
                        content={elm.content}
                        subTasks={elm.subTasks}
                        darkMod={darkMod}
                    />
                ))}
            </Droppable>
        </div>
    );
};

export default Column;