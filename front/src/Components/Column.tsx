import { FC, useMemo, useState } from "react";
import * as _ from "radash";
import Droppable from "../Primitives/Droppable";
import DraggableElement from "./DraggableElement";
import { faEllipsis, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface IElement {
  id: string;
  content: string;
  description: string;
  column: string;
  checkedTask: string[];
  subTasks: string[];
}

type Columns = {id: string, name: string, color: string};

interface IColumn {
    id: string;
    heading: string;
    columnsColor: string;
    elements: IElement[];
    columns: Columns[]
    darkMod: boolean;
}

const Column: FC<IColumn> = ({ id, heading, elements, columns, columnsColor, darkMod }) => {
    const columnIdentifier = useMemo(() => _.camel(id), [id]);   

    const amounts = useMemo(
        () => elements.filter((elm) => elm.column === columnIdentifier).length,
        [elements, columnIdentifier]
    );

    const [toggleMenu, setToggleMenu] = useState<boolean>(false);
    const [toggleInput, setToggleInput] = useState<boolean>(false);
    const [toggleDeleteConfirmation, setToggleDeleteConfirmation] = useState<boolean>(false);

    const toggleDisplayMenu = () => {
        if (toggleInput === true) {
            setToggleInput(false);
        }
        setToggleMenu(!toggleMenu);
    };

    const toggleDisplayInput = () => {
        setToggleInput(!toggleInput);
    };

    const toggleDelete = () => {
        setToggleDeleteConfirmation(!toggleDeleteConfirmation);
    };

    return (
        <>
        <div className="column">
            <div className="column__header">
                <div className="column__header__cont">
                    <div style={{ "backgroundColor": columnsColor }} className="column__header__cont__colors"></div>
                    <h3>{ heading }</h3>
                    <span>({amounts})</span>
                </div>
                <FontAwesomeIcon onClick={toggleDisplayMenu} icon={faEllipsis} className="column__header__menuBtn" />
            </div>
            <Droppable id={columnIdentifier}>
                {elements.map((elm, elmIndex) => (
                        <DraggableElement
                            key={`draggable-element-${elmIndex}-${columnIdentifier}`}
                            identifier={elm.id}
                            content={elm.content}
                            checkTasks={elm.checkedTask}
                            subTasks={elm.subTasks}
                            darkMod={darkMod}
                            columnId={id}
                        />        
                    ))}
            </Droppable>
        </div>
        {
            toggleMenu &&
            <div className="column__menu">
                {
                    toggleDeleteConfirmation ?
                    <div className={darkMod ? "column__menu__modal column__menu__modal--dark" : "column__menu__modal column__menu__modal--light"}>
                        <h2>Supprimer la colonne { heading } ?</h2>
                        <p className="">Cette action est irréversible !</p>
                        <div className="">
                            <input type="button" value="Supprimer" />
                            <input onClick={toggleDelete} type="button" value="Annuler" />
                        </div>
                    </div>
                    :
                    <div className={darkMod ? "column__menu__modal column__menu__modal--dark" : "column__menu__modal column__menu__modal--light"}>
                        <input className='column__menu__modal__closeBtn' onClick={toggleDisplayMenu} type="button" value="X" />
                        <div className="column__menu__modal__titleCont">
                            {
                                toggleInput ?
                                <div className="column__menu__modal__titleCont__forModif">
                                    <div className="">
                                        <input type="color" name="" id="" value={columnsColor} />
                                        <label htmlFor="">Modifier la couleur</label>
                                    </div>
                                    <div className="">
                                        <label htmlFor="">Nom de la colonne</label>
                                        <input type="text" name="" id="" />
                                    </div>
                                    <div className="">
                                        <input type="button" value="Changer" />
                                        <input onClick={toggleDisplayInput} type="button" value="Annuler" />
                                    </div>
                                </div>
                                :
                                <div className="column__menu__modal__titleCont__title">
                                    <div style={{ "backgroundColor": columnsColor }} className="column__menu__modal__titleCont__title__color"></div>
                                    <h2>{heading}</h2>
                                    <FontAwesomeIcon onClick={toggleDisplayInput} icon={faPencil} className="column__menu__modal__titleCont__title__btn" />
                                </div>
                            }
                        </div>
                        <div className="">
                            <label htmlFor="">Changer de position</label>
                            <select name="" id="">
                                {
                                    columns[0].id !== id &&
                                    <option value="">Début</option>
                                }
                                {
                                    columns.map((el, elInd) => {  
                                        let ind: number = 0;
                                        for (let i = 0; i < columns.length; i++) {
                                            if (columns[i].id === id) {
                                                ind = i;
                                            }
                                        }
                                        
                                        if (el.id !== id && elInd !== (ind - 1)) {
                                            return <option value="">Après {el.name}</option>
                                        }
                                    })
                                }
                            </select>
                        </div>
                        <div className="">
                            <input onClick={toggleDelete} type="button" value="Supprimer la colonne" />
                        </div>
                    </div>
                }
            </div>
        }
        </>
    );
};

export default Column;