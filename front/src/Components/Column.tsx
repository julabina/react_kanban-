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
  updatedAt: number;
}

type Columns = {id: string, name: string, color: string};

interface IColumn {
    id: string;
    heading: string;
    columnsColor: string;
    elements: IElement[];
    columns: Columns[];
    darkMod: boolean;
    projectId: string;
    token: string;
    getAllProject: () => void;
}

const Column: FC<IColumn> = ({ id, heading, elements, columns, columnsColor, darkMod, projectId, token, getAllProject }) => {
    const columnIdentifier = useMemo(() => _.camel(id), [id]);   

    const amounts = useMemo(
        () => elements.filter((elm) => elm.column === columnIdentifier).length,
        [elements, columnIdentifier]
    );

    type ColumnInput = {color: string, title: string};

    const [toggleMenu, setToggleMenu] = useState<boolean>(false);
    const [toggleInput, setToggleInput] = useState<boolean>(false);
    const [toggleDeleteConfirmation, setToggleDeleteConfirmation] = useState<boolean>(false);
    const [modifColumnInput, steModifColumnInput] = useState<ColumnInput>({color: "", title: ""});

    /**
     * toggle column menu modal
     */
    const toggleDisplayMenu = () => {  
        if (toggleDeleteConfirmation) {
            setToggleDeleteConfirmation(false);
        }      
        if (toggleInput === true) {
            setToggleInput(false);
        } else {
            steModifColumnInput({color: columnsColor, title: heading});
        }
        setToggleMenu(!toggleMenu);
    };

    /**
     * toggle input for modifying title and color for one column
     */
    const toggleDisplayInput = () => {
        setToggleInput(!toggleInput);
    };

    /**
     * toggle delete confirmation section
     */
    const toggleDelete = () => {
        setToggleDeleteConfirmation(!toggleDeleteConfirmation);
    };

    /**
     * control input for modify informations
     * 
     * @param action 
     * @param value 
     */
    const ctrlModifColumnInput = (action: string, value: string) => {
        if (action === "title") {
            const newObj: ColumnInput = {
                ...modifColumnInput,
                title: value
            };
            steModifColumnInput(newObj);
        } else if (action === "color") {
            const newObj: ColumnInput = {
                ...modifColumnInput,
                color: value
            };
            steModifColumnInput(newObj);
        }
    };

    /**
     * 
     * validate modif informations inputs
     * 
     * @param e 
     * @returns 
     */
    const validateModifColumn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errorCont = document.querySelector(".column__menu__modal__titleCont__forModif__errorCont");

        if (errorCont) {
            errorCont.innerHTML = "";

            if (modifColumnInput.title === "") {
                return errorCont.innerHTML = `<p>- Le titre ne peut pas etre vide.</p>`;
            } else if (modifColumnInput.title.length > 50) {
                return errorCont.innerHTML = `<p>- Le nom de la colonne doit contenir 50 caractères maximum.</p>`;
            } else if (!modifColumnInput.title.match(/^[\w éèàêî]*$/i)) {
                return errorCont.innerHTML = `<p>- Le nom de la colonne ne doit contenir que des lettres et des chiffres.</p>`;
            }
            
            if (!modifColumnInput.color.match(/^[\w#]*$/i) || modifColumnInput.color === "") {
                const newObj: ColumnInput = {
                    ...modifColumnInput,
                    color: "#ccc"
                };
                steModifColumnInput(newObj);
            }

            if (modifColumnInput.color !== columnsColor || modifColumnInput.title !== heading) {   
                updateColumn();
            }
        }
    };

    /**
     * update title and color column on database 
     */
    const updateColumn = () => {
        fetch(process.env.REACT_APP_API_URL + "/api/column/update", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            }, method: "PUT",
            body: JSON.stringify({ title: modifColumnInput.title, color: modifColumnInput.color, id: id })
        })
            .then(res => {
                if (res.status === 201) {
                    toggleDisplayMenu();  
                    changePosition("0");
                }
            });
    };

    /**
     * update column position on database
     */
    const changePosition = (value: string) => {
        if (value !== "null") {
            fetch(process.env.REACT_APP_API_URL + "/api/column/updatePosition", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token,
                }, 
                method: "PUT",
                body: JSON.stringify({ position: value, id: id })
            })
                .then(res => {
                    if (res.status === 201) {
                        toggleDisplayMenu();  
                        getAllProject(); 
                    }
                });
            }
        };
        
        const deleteColumn = () => {
        fetch(process.env.REACT_APP_API_URL + '/api/column/delete/' + id, {
            headers: {
                "Authorization": "Bearer " + token,
            }, 
            method: "DELETE",
        })
            .then(res => {
                if (res.status === 201) {
                    toggleDisplayMenu();
                    getAllProject(); 
                } else if (res.status === 401) {
                    toggleDisplayMenu();
                    alert("Impossible de supprimer la derniere colonne.");
                } else {
                    res.json()
                        .then(data => {
                            console.log(data);
                            
                            alert(data.message);
                        })
                }
            })
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
                            description={elm.description}
                            checkTasks={elm.checkedTask}
                            subTasks={elm.subTasks}
                            darkMod={darkMod}
                            columnId={id}
                            getAllProject={() => getAllProject()}
                            token={token}
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
                        <p className="column__menu__modal__alertDeleteConfirm">Cette action est irréversible !</p>
                        <div className="column__menu__modal__btnsConfirm">
                            <input id="confirmDelete" onClick={deleteColumn} type="button" value="Supprimer" />
                            <input onClick={toggleDelete} type="button" value="Annuler" />
                        </div>
                    </div>
                    :
                    <div className={darkMod ? "column__menu__modal column__menu__modal--dark" : "column__menu__modal column__menu__modal--light"}>
                        <input className='column__menu__modal__closeBtn' onClick={toggleDisplayMenu} type="button" value="X" />
                        <div className="column__menu__modal__titleCont">
                            {
                                toggleInput ?
                                <form onSubmit={validateModifColumn} className="column__menu__modal__titleCont__forModif">
                                    <div className="column__menu__modal__titleCont__forModif__errorCont"></div>
                                    <div className="column__menu__modal__titleCont__forModif__color">
                                        <input onInput={(e) => ctrlModifColumnInput('color', (e.target as HTMLInputElement).value)} type="color" id="modifColumnColor" value={modifColumnInput.color} />
                                        <label htmlFor="modifColumnColor">Modifier la couleur</label>
                                    </div>
                                    <div className="column__menu__modal__titleCont__forModif__title">
                                        <label htmlFor="modifColumnTitle">Nom de la colonne</label>
                                        <input onInput={(e) => ctrlModifColumnInput('title', (e.target as HTMLInputElement).value)} value={modifColumnInput.title} type="text" id="modifColumnTitle" />
                                    </div>
                                    <div className="column__menu__modal__titleCont__forModif__btns">
                                        <input type="submit" value="Changer" />
                                        <input onClick={toggleDisplayInput} type="button" value="Annuler" />
                                    </div>
                                </form>
                                :
                                <div className="column__menu__modal__titleCont__title">
                                    <div style={{ "backgroundColor": columnsColor }} className="column__menu__modal__titleCont__title__color"></div>
                                    <h2>{ heading }</h2>
                                    <FontAwesomeIcon onClick={toggleDisplayInput} icon={faPencil} className="column__menu__modal__titleCont__title__btn" />
                                </div>
                            }
                        </div>
                        <div className="column__menu__modal__position">
                            <label htmlFor="modifPositionColumn">Changer de position</label>
                            <select className={darkMod ? "column__menu__modal__position__select column__menu__modal__position__select--dark" : "column__menu__modal__position__select column__menu__modal__position__select--light"} onChange={(e) => changePosition((e.target as HTMLSelectElement).value)} id="modifPositionColumn">
                                <option value="null">----</option>
                                {
                                    columns[0].id !== id &&
                                    <option value="0">Début</option>
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
                                            return <option key={'option' + elInd} value={elInd}>Après {el.name}</option>
                                        }
                                    })
                                }
                            </select>
                        </div>
                        <div className="column__menu__modal__deleteBtn">
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