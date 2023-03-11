import { useDraggable } from "@dnd-kit/core";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IDraggable {
    id: string;
    children: ReactNode;
    darkMod: boolean;
    content: string;
    checkTasks: string[];
    subTasks: string[];
  }

const Draggable: FC<IDraggable> = ({ id, children, darkMod, checkTasks, subTasks, content }) => {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const [menuToggle, setMenuToggle] = useState<boolean>(false);
    const [inputToggle, setInputToggle] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(content);
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
            }  
        } 
   },[])   

    const style = useMemo(() => {
        if (transform) {
        return {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        };
        }
        return undefined;
    }, [transform]);

    const toggleMenu = () => {        
        if (inputToggle) {
            setInputToggle(false);
        }
        if (inputToggle) {
            setTitle(content);
        }
        setMenuToggle(!menuToggle);
    };

    const toggleTitleInput = () => {        
        if (inputToggle) {
            setTitle(content);
        }
        setInputToggle(!inputToggle);
    };

    const ctrlTitleInput = (value: string) => {
        setTitle(value);
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
            <div className="draggable__taskMenu">
                <div className={darkMod ? "draggable__taskMenu__modal draggable__taskMenu__modal--dark" : "draggable__taskMenu__modal draggable__taskMenu__modal--light"}>
                    <input className='draggable__taskMenu__modal__closeBtn' onClick={toggleMenu} type="button" value="X" />
                    <div className="draggable__taskMenu__modal__titleCont">
                        {
                            inputToggle ?
                            <div className="draggable__taskMenu__modal__titleCont__input">
                                <input onInput={(e) => ctrlTitleInput((e.target as HTMLInputElement).value)} type="text" value={title}/>
                                <div className="draggable__taskMenu__modal__titleCont__input__btnCont">
                                    <input type="button" value="Changer" />
                                    <input onClick={toggleTitleInput} type="button" value="Annuler" />
                                </div>
                            </div>
                            :
                            <div className="draggable__taskMenu__modal__titleCont__content">
                                <h2>{content}</h2>
                                <FontAwesomeIcon onClick={toggleTitleInput} icon={faPencil} className="draggable__taskMenu__modal__titleCont__content__btn" />
                            </div>
                        }
                    </div>
                    <div className="draggable__taskMenu__modal__subTasks">
                        {
                            tasks.length !== 0 &&
                                
                            tasks.map((el, elInd) => {
                                return (
                                    <div key={"subTaskCheck" + elInd} className="draggable__taskMenu__modal__subTasks__check">
                                        <input type="checkbox" name="" id="" checked={checkedArr[elInd]}/>
                                        <label htmlFor="">{el}</label>
                                    </div>
                                )
                            })
                            
                        }
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Draggable;