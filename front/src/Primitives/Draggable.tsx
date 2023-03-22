import { useDraggable } from "@dnd-kit/core";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IDraggable {
    id: string;
    children: ReactNode;
    darkMod: boolean;
    content: string;
    description: string;
    checkTasks: string[];
    subTasks: string[];
    getAllProject: () => void;
    token: string;
  }

const Draggable: FC<IDraggable> = ({ id, children, darkMod, checkTasks, subTasks, content, description, getAllProject, token }) => {

    type Input = {title: string, description: string};

    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const [menuToggle, setMenuToggle] = useState<boolean>(false);
    const [inputToggle, setInputToggle] = useState<boolean>(false);
    const [deleteToggle, setDeleteToggle] = useState<boolean>(false);
    const [title, setTitle] = useState<Input>({title: "", description: ""});
    const [tasks, setTasks] = useState<string[]>([]);
    const [checkedArr, setCheckedArr] = useState<boolean[]>([]);

   useEffect(() => {
        if (subTasks && subTasks.length > 0) {
            if (subTasks[0] !== "") {
                setTasks(subTasks);

                let arr: boolean[] = [];

                for (let i = 0; i < checkTasks.length; i++) {
                    if (checkTasks[i] === "true") {
                        arr.push(true);
                    } else {
                        arr.push(false);
                    }
                }

                setCheckedArr(arr);
            }  
        } 
   },[checkTasks])   

    const style = useMemo(() => {
        if (transform) {
        return {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        };
        }
        return undefined;
    }, [transform]);

    /**
     * toggle menu modal
     */
    const toggleMenu = () => {        
        if (inputToggle) {
            setInputToggle(false);
        }
        setTitle({title: content, description: description});
        setMenuToggle(!menuToggle);
    };

    /**
     * toggle input form
     */
    const toggleTitleInput = () => {        
        if (inputToggle) {
            setTitle({title: content, description: description});
        }
        setInputToggle(!inputToggle);
    };

    /**
     * control input for modify informations
     * 
     * @param action 
     * @param value 
     */
    const ctrlTitleInput = (action: string, value: string) => {
        if (action === 'title') {
            const newObj: Input = {
                ...title,
                title: value
            };
            setTitle(newObj);
        } else if (action === 'description') {
            const newObj: Input = {
                ...title,
                description: value
            };
            setTitle(newObj);
        }
    };

    /**
     * validate modified inputs 
     * 
     * @param e 
     * @returns 
     */
    const validateInput = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errorCont = document.querySelector('.draggable__taskMenu__modal__errorCont');

        if (errorCont) {
            let error = "";
            errorCont.innerHTML = "";

            if (title.title === "") {
                return errorCont.innerHTML = `<p>- le titre est requis.</p>`;
            }

            if (title.title.length < 2 || title.title.length > 100) {
                error = `<p>- La taille du titre doit etre comprise entre 2 et 100 caractères.</p>`;
            } else if (!title.title.match(/^[\wé èà\-\']*$/i)) {
                error = `<p>- Le titre ne doit contenir que des lettres et des chiffres.</p>`;
            }
            
            if (title.description.length > 100) {
                error += `<p>- La description ne doit contenir que 100 caractères maximum.</p>`;   
            } else if (!title.description.match(/^[\wé èà\-\']*$/im)) {
                error += `<p>- La description ne doit contenir que des lettres et des chiffres.</p>`;
            }

            if (error !== "") {
                return errorCont.innerHTML = error;
            }

            if (title.title === content && title.description === description) {
                toggleTitleInput();
            } else {
                tryToUpdateTask();
            }

        } 
    };

    /**
     * try to update one task on database
     */
    const tryToUpdateTask = () => {
        fetch(process.env.REACT_APP_API_URL + "/api/task/update/" + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            }, 
            method: "PUT",
            body: JSON.stringify({title: title.title, description: title.description })
        })
            .then(res => {
                if (res.status === 201) {
                    toggleMenu();
                    getAllProject();
                }
            })
    };

    /**
     * toggle delete confirmation section
     */
    const toggleDelete = () => {
        setDeleteToggle(!deleteToggle);
    };

    /**
     * delete one task on database
     */
    const deleteTask = () => {
        fetch(process.env.REACT_APP_API_URL + "/api/task/delete/" + id, {
            headers: {
                "Authorization": "Bearer " + token,
            }, 
            method: "DELETE"
        })
            .then(res => {
                if (res.status === 201) {
                    toggleMenu();
                    getAllProject();
                }
            })
    };

    /**
     * update subtask, checked or unchecked
     * 
     * @param index 
     */
    const updateSubTask = (index: number) => {
        fetch(process.env.REACT_APP_API_URL + "/api/task/check/" + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            }, 
            method: "PUT",
            body: JSON.stringify({ index: index })
        })
            .then(res => {
                if (res.status === 201) {
                    getAllProject();
                }
            })
    };

    return (
        <>
        <div className="draggable">
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                {children}
            </div>
            <input className="draggable__taskBtn" onClick={toggleMenu} type="button" value="..." />
        </div>
        {
            menuToggle &&
            <>
            <div className="draggable__taskMenu">
            {
                deleteToggle ?
                    <div className={darkMod ? "draggable__taskMenu__modal draggable__taskMenu__modal--dark" : "draggable__taskMenu__modal draggable__taskMenu__modal--light"}>
                        <h2>Supprimer la tache { content } ?</h2>
                        <p className="draggable__taskMenu__modal__alertDeleteConfirm">Cette action est irréversible !</p>
                        <div className="draggable__taskMenu__modal__btnsConfirm">
                            <input id="confirmDelete" onClick={deleteTask} type="button" value="Supprimer" />
                            <input onClick={toggleDelete} type="button" value="Annuler" />
                        </div>
                    </div>
                :
                        <div className={darkMod ? "draggable__taskMenu__modal draggable__taskMenu__modal--dark" : "draggable__taskMenu__modal draggable__taskMenu__modal--light"}>
                            <input className='draggable__taskMenu__modal__closeBtn' onClick={toggleMenu} type="button" value="X" />
                            <div className="draggable__taskMenu__modal__titleCont">
                                {
                                    inputToggle ?
                                    <form className="draggable__taskMenu__modal__form" onSubmit={validateInput}>
                                        <div className="draggable__taskMenu__modal__errorCont"></div>
                                        <div className="draggable__taskMenu__modal__form__inputCont">
                                            <label htmlFor="modifTaskTitle">Titre</label>
                                            <input onInput={(e) => ctrlTitleInput("title" ,(e.target as HTMLInputElement).value)} type="text" value={title.title} id='modifTaskTitle'/>
                                        </div>
                                        <div className="draggable__taskMenu__modal__form__inputCont">
                                            <label htmlFor="modifTaskDescription">Description</label>
                                            <textarea onInput={(e) => ctrlTitleInput('description', (e.target as HTMLInputElement).value)} value={title.description} id="modifTaskDescription"></textarea>
                                        </div>
                                        <div className="draggable__taskMenu__modal__titleCont__input__btnCont">
                                            <input type="submit" value="Changer" />
                                            <input onClick={toggleTitleInput} type="button" value="Annuler" />
                                        </div>
                                    </form>
                                    :
                                    <>
                                    <div className="draggable__taskMenu__modal__titleCont__content">
                                        <h2>{content}</h2>
                                        <FontAwesomeIcon onClick={toggleTitleInput} icon={faPencil} className="draggable__taskMenu__modal__titleCont__content__btn" />
                                    </div>
                                    <p>{ description }</p>
                                    </>
                                }
                            </div>
                            <div className="draggable__taskMenu__modal__subTasks">
                                {
                                    tasks.length !== 0 &&
                                        
                                    tasks.map((el, elInd) => {
                                        return (
                                            <div key={"subTaskCheck" + elInd} className="draggable__taskMenu__modal__subTasks__check">
                                                <input onChange={() => updateSubTask(elInd)} type="checkbox" id={"forCheck" + elInd} checked={checkedArr[elInd]}/>
                                                <label htmlFor={"forCheck" + elInd}>{el}</label>
                                            </div>
                                        )
                                    })
                                    
                                }
                            </div>
                            <div className="draggable__taskMenu__modal__deleteBtn">
                                <input onClick={toggleDelete} type="button" value="Supprimer la tache" />
                            </div>
                        </div>
            }
            </div>
            </>
        }
        </>
    );
};

export default Draggable;