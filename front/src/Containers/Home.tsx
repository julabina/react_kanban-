import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { faRectangleList, faSun } from '@fortawesome/free-regular-svg-icons';
import { faCloudMoon, faEyeSlash, faEllipsisVertical, faXmark } from '@fortawesome/free-solid-svg-icons';
import appLogo from '../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import Column, { IElement } from '../Components/Column';
import * as _ from "radash";

const Home = () => {

    const navigate = useNavigate();

    type StoredToken = {version: string, content: string};
    type Token = {version: string, content: string};
    type DecodedToken = {userId: string, token: Token};
    type NewBoardInput = {title: string, description: string};
    type NewColumnInput = {name: string, color: string, position: string};
    type NewTaskInput = {title: string, description: string, subTasks: string[], status: number};
    type Board = {id: string, title: string, columns: string[], updatedAt: number};
    type Columns = {id: string, name: string, color: string};

    const [actualUser, setActualUser] = useState<DecodedToken>({ userId: "", token: {version: "", content: ""} });
    const [toggleNewBoardModal, setToggleNewBoardModal] = useState<boolean>(false);
    const [toggleNewColumnModal, setToggleNewColumnModal] = useState<boolean>(false);
    const [toggleNewTaskModal, setToggleNewTaskModal] = useState<boolean>(false);
    const [newBoardInput, setNewBoardInput] = useState<NewBoardInput>({ title: "", description: "" });
    const [newColumnInput, setNewColumnInput] = useState<NewColumnInput>({ name: "", color: "white", position: "start"});
    const [newTaskInput, setNewTaskInput] = useState<NewTaskInput>({title: "", description: "", subTasks: ["", ""], status: 0});
    const [boards, setBoards] = useState<Board[]>([]);
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [activProject, setActivProject] = useState<Board>({id: "", title: "", columns: [], updatedAt: 0});
    const [darkMod, setDarkMod] = useState<boolean>(false);
    const [displayAllBoard, setDisplayAllBoard] = useState<boolean>(false);
    const [tasks, setTasks] = useState<IElement[]>([]);

    const [columns, setColumns] = useState<Columns[]>([]);

    const handleOnDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            const elementId = active.id;
            const deepCopy = [...tasks];  
                    
            const updatedState = deepCopy.map((elm): IElement => {
                if (elm.id === elementId) {
                    const column = over?.id ? String(over.id) : elm.column;
                    return { ...elm, column };
                }
                return elm;
            });

            
            const elementIdFiltered = updatedState.filter(el => {
                return el.id === elementId;
            });
            
            updateTaskPosition(elementIdFiltered[0]);
            setTasks(updatedState);
        },
        [tasks, setTasks]
    );

    useEffect(() => {        
        if (localStorage.getItem('react_kanban_token') !== null) {
            let getToken = localStorage.getItem('react_kanban_token') || "";
            
            const tokenObj: StoredToken = {
                version: JSON.parse(getToken).version,
                content: JSON.parse(getToken).content
            }
            
            let token: StoredToken = tokenObj;
            if (token !== null) {
                let decodedToken: DecodedToken = decodeToken(token.version) || {userId: "",token: {version: "", content: ""}};
                let isTokenExpired = isExpired(token.version);

                if (decodedToken.userId !== token.content || isTokenExpired === true) {
                    // DISCONNECT
                    localStorage.removeItem('react_kanban_token');
                    return navigate('/connexion', { replace: true });
                };
                
                const user: DecodedToken = {userId: decodedToken.userId, token};
                
                setActualUser(user);
                setDarkMod(JSON.parse(getToken).dark)
                getAllProjects(user.userId, user.token.version);
                
            } else {
                // DISCONNECT
                localStorage.removeItem('react_kanban_token');
                navigate('/connexion', { replace: true });
            };
        } else {
            // DISCONNECT
            navigate('/connexion', { replace: true });
        };   
    },[]);

    /**
     * get all board from one user
     * 
     * @param id 
     * @param token 
     */
    const getAllProjects = (id: string, token: string) => {
        fetch(process.env.REACT_APP_API_URL + "/api/project/getAll/" + id, {
            headers: {
                "Authorization": "Bearer " + token
            },
            method: "GET"
        })
            .then(res => res.json())
            .then(data => {
                let newArr: Board[] = [];
                
                if (data.data && data.data.length !== 0) {
                    for (let i = 0; i < data.data.length; i++) {
                        const newObj: Board = {
                            id: data.data[i].id,
                            title: data.data[i].title,
                            columns: data.data[i].columns,
                            updatedAt: Math.floor((new Date(data.data[i].updatedAt)).getTime() / 1000)
                        };

                        newArr.push(newObj);
                    }
                    
                    newArr.sort((a, b) => b.updatedAt - a.updatedAt);
                
                    const firstBoard = newArr.slice(0, 4);

                    setBoards(firstBoard);                    
                    setAllBoards(newArr);
                    setActivProject(firstBoard[0]);
                    getAllColumns(firstBoard[0].id, token);
                }
            })
    };

    /**
     * get all task for one project
     */
    const getAllColumns = (id: string, token: string) => {
        fetch(process.env.REACT_APP_API_URL + "/api/column/getAll/" + id, {
            headers: {
                "Authorization": "Bearer " + token
            },
            method: "GET"
        })
            .then(res => res.json())
            .then(data => {
                if (data.data[0] && data.data[0].length !== 0) {
                    console.log(data.data[0]);
                    
                    let colArr: Columns[] = [];

                    for (let i = 0; i < data.data[0].length; i++) {
                        const newObj: Columns = {
                            id: data.data[0][i].id.toString(),
                            name: data.data[0][i].name,
                            color: data.data[0][i].color
                        };

                        colArr.push(newObj);
                        
                    }
                    
                    setColumns(colArr);

                    if (data.data[1] && data.data[1].length !== 0) {
                        
                        let arr: IElement[] = [];
                        
                        for (let i = 0; i < data.data[1].length; i++) {
                            const newObj: IElement = {
                                id: data.data[1][i].id,
                                content: data.data[1][i].title,
                                description: data.data[1][i].description,
                                column: data.data[1][i].status,
                                checkedTask: data.data[1][i].checked,
                                subTasks: data.data[1][i].subTask,
                            };                            
                            
                            arr.push(newObj);
                        }
                        
                        setTasks(arr);
                        
                    }
                }
            })
    };

    /**
     * Update task position after drag and drop
     * 
     * @param tasks 
     */
    const updateTaskPosition = (tasks: IElement) => {
        fetch(process.env.REACT_APP_API_URL + "/api/task/updatePosition", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + actualUser.token.version,
            },
            method: "PUT",
            body: JSON.stringify({ tasks })
        })  
    };

    /**
     * toggle modal for create new board
     */
    const toggleModalNewBoard = () => {
        if (toggleNewBoardModal) {
            setNewBoardInput({ title: "", description: "" });
        }

        setToggleNewBoardModal(!toggleNewBoardModal);
        
    };

    /**
     * toggle modal for create new column
     */
    const toggleModalNewColumn = () => {        
        if (toggleNewColumnModal) {
            setNewColumnInput({ name: "", color: "", position: "" });
        }

        setToggleNewColumnModal(!toggleNewColumnModal);
        
    };

    /**
     * toggle modal for create new task
     */
    const toggleModalNewTask = () => {        
        if (toggleNewTaskModal) {
            setNewTaskInput({title: "", description: "", subTasks: ["", ""], status: 0});
        }

        setToggleNewTaskModal(!toggleNewTaskModal);
        
    };

    /**
     * create new board on database
     */
    const tryToCreateNewBoard = () => {
        const newBoardErrorCont = document.querySelector('.home__modalNewBoard__modal__errorCont');

        fetch(process.env.REACT_APP_API_URL + '/api/project/create', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + actualUser.token.version,
            },
            method: 'POST',
            body: JSON.stringify({ title: newBoardInput.title, description: newBoardInput.description, userId: actualUser.userId })
        })
            .then(res => {
                if (res.status === 201) {
                    toggleModalNewBoard();
                    const newObj = {
                        title: "", 
                        description: "" 
                    };
                    setNewBoardInput(newObj);
                    getAllProjects(actualUser.userId, actualUser.token.version);
                } else {
                    res.json()
                        .then(data => {
                            if (newBoardErrorCont) {
                                if (data.message) {
                                    newBoardErrorCont.innerHTML = `` + data.message + ``;
                                } else {
                                    newBoardErrorCont.innerHTML = `- Une erreur est survenue.`;
                                }
                            }
                        })
                }
            })
    };

    /**
     * control new board modal input
     * 
     * @param action 
     * @param value 
     */
    const ctrlNewBoardInput = (action: string, value: string) => {
        if (action === 'title') {
            const newObj = {
                ...newBoardInput,
                title: value
            };
            setNewBoardInput(newObj);
        } else if (action === 'description') {
            const newObj = {
                ...newBoardInput,
                description: value
            };
            setNewBoardInput(newObj);
        }
    };

    /**
     * validate new board form before create new board
     * 
     * @param e 
     * @returns 
     */
    const validateNewBoard = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newBoardErrorCont = document.querySelector('.home__modalNewBoard__modal__errorCont');

        if (newBoardErrorCont) {    
            let errors: string = "";
            newBoardErrorCont.innerHTML = "";
            
            if (newBoardInput.title === "") {
                return newBoardErrorCont.innerHTML = `<p>- Le titre est obligatoire.</p>`;
            }

            if (newBoardInput.title === "") {
                errors = `<p>- Le titre est requis.</p>`;
            } else if (newBoardInput.title.length < 3 || newBoardInput.title.length > 100) {
                errors = `<p>- La taille du titre doit etre comprise entre 2 et 100 caractères.</p>`;          
            } else if (!newBoardInput.title.match(/^[\wé èà\-]*$/i)) {
                errors = `<p>- Le titre ne doit contenir que des lettres et des chiffres.</p>`;
            }

            if (newBoardInput.description !== "") {
                if (newBoardInput.description.length > 100) {
                    errors += `<p>- La description doit comprendre maximum 100 caractères.</p>`;          
                } else if (!newBoardInput.description.match(/^[\wé èà\-]*$/i)) {
                    errors += `<p>- La description ne doit contenir que des lettres et des chiffres.</p>`;
                }
            }

            if (errors !== "") {
                newBoardErrorCont.innerHTML = errors;
            } else {
                tryToCreateNewBoard();
            }

        }
    };

    /**
     * control new column input
     * 
     * @param action 
     * @param value 
     */
    const ctrlNewColInput = (action: string, value: string) => {
        if (action === "name") {
            const newObj: NewColumnInput = {
                ...newColumnInput,
                name: value
            };
            setNewColumnInput(newObj);
        } else if (action === 'color') {
            const newObj: NewColumnInput = {
                ...newColumnInput,
                color: value
            };
            setNewColumnInput(newObj);        
        } else if (action === "position") {
            const newObj: NewColumnInput = {
                ...newColumnInput,
                position: value
            };
            setNewColumnInput(newObj);
        }
    };

    /**
     * validate new column input before create new column
     * 
     * @param e 
     */
    const validateNewColumn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errorCont = document.querySelector(".home__modalNewColumn__modal__errorCont");
        let error = "";

        if (errorCont) {
            errorCont.innerHTML = "";
            
            if (newColumnInput.name === "") {
                return errorCont.innerHTML = `<p>- Le nom de la colonne est requis.</p>`;
            } else if (newColumnInput.name.length > 50) {
                return errorCont.innerHTML = `<p>- Le nom de la colonne doit contenir 50 caractères maximum.</p>`;
            } else if (!newColumnInput.name.match(/^[\w éèàêî]*$/i)) {
                return errorCont.innerHTML = `<p>- Le nom de la colonne ne doit contenir que des lettres et des chiffres.</p>`;
            }
            
            if (!newColumnInput.color.match(/^[\w#]*$/i) || newColumnInput.color === "") {
                const newObj: NewColumnInput = {
                    ...newColumnInput,
                    color: "#ccc"
                };
                setNewColumnInput(newObj);
            }
            if (newColumnInput.position === "") {
                const newObj: NewColumnInput = {
                    ...newColumnInput,
                    position: "start"
                };
                setNewColumnInput(newObj);  
            }

            tryToCreateNewColumn();
        }
    };

    /**
     * control new task input
     * 
     * @param action 
     * @param value 
     */
    const ctrlNewTaskInput = (action: string, value: string, subInd?: number) => {       
        if (action === 'title') {
            const newObj: NewTaskInput = {
                ...newTaskInput,
                title: value
            }
            setNewTaskInput(newObj);
        } else if (action === 'description') {
            const newObj: NewTaskInput = {
                ...newTaskInput,
                description: value
            }
            setNewTaskInput(newObj);
        } if (action === "subTask" && subInd !== undefined) {
            let arr = newTaskInput.subTasks;
            arr[subInd] = value;
            
            const newObj: NewTaskInput = {
                ...newTaskInput,
                subTasks: arr
            }
            setNewTaskInput(newObj);
        } if (action === "status") {            
            const newObj: NewTaskInput = {
                ...newTaskInput,
                status: parseInt(value)
            }
            setNewTaskInput(newObj);
        }
    };

    /**
     * validate new task input before create new task
     * 
     * @param e 
     */
    const validateNewTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errorCont = document.querySelector('.home__modalNewTask__modal__errorCont');

        if (errorCont) {
            let error = "";
            errorCont.innerHTML = "";

            if (newTaskInput.title === "") {
                return errorCont.innerHTML = `<p>- le titre est requis.</p>`;
            }
            
            if (newTaskInput.subTasks.length > 0) {
                for (let i = 0; i < newTaskInput.subTasks.length; i++) {
                    if (newTaskInput.subTasks[i] === "") {
                        return errorCont.innerHTML = `<p>- Tous les champs de sous tache sont requis.</p>`;
                    }
                }
            }

            if (newTaskInput.title.length < 2 || newTaskInput.title.length > 100) {
                error = `<p>- La taille du titre doit etre comprise entre 2 et 100 caractères.</p>`;
            } else if (!newTaskInput.title.match(/^[\wé èà\-\']*$/i)) {
                error = `<p>- Le titre ne doit contenir que des lettres et des chiffres.</p>`;
            }
            
            if (newTaskInput.description.length > 100) {
                error += `<p>- La description ne doit contenir que 100 caractères maximum.</p>`;   
            } else if (!newTaskInput.description.match(/^[\wé èà\-\']*$/im)) {
                error += `<p>- La description ne doit contenir que des lettres et des chiffres.</p>`;
            }
            
            if (newTaskInput.subTasks.length > 0) {
                for (let i = 0; i < newTaskInput.subTasks.length; i++) {
                    if (newTaskInput.subTasks[i].length < 2 || newTaskInput.subTasks[i].length > 100) {
                        error += `<p>- Les champs de sous tache ne doivent contenir que des lettres et des chiffres, et etre d'une taille comprise entre 2 et 100 caractères.</p>`;
                        break;
                    } else if (!newTaskInput.title.match(/^[\wé èà\-\']*$/i)) {
                        error += `<p>- Les champs de sous tache ne doivent contenir que des lettres et des chiffres, et etre d'une taille comprise entre 2 et 100 caractères.</p>`;
                        break;
                    }
                }             
            }

            if (error !== "") {
                return errorCont.innerHTML = error;
            }

            tryToCreateNewTask();
        }        
    };

    /**
     * create new task on database
     */
    const tryToCreateNewTask = () => {
        fetch(process.env.REACT_APP_API_URL + "/api/task/create/" + activProject.id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + actualUser.token.version,
            },
            method: "POST",
            body: JSON.stringify({ title: newTaskInput.title, description: newTaskInput.description, subTask: newTaskInput.subTasks, status: activProject.columns[newTaskInput.status], userId: actualUser.userId })
        })
            .then(res => {
                if (res.status === 201) {
                    setNewTaskInput({title: "", description: "", subTasks: ["", ""], status: 0});
                    toggleModalNewTask();
                    getAllColumns(activProject.id, actualUser.token.version);
                }
            })        
    };

    /**
     * create on database, one new column for one project
     */
    const tryToCreateNewColumn = () => {
        console.log(newColumnInput);
        
        fetch(process.env.REACT_APP_API_URL + "/api/column/create/" + activProject.id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + actualUser.token.version,
            },
            method: "POST",
            body: JSON.stringify({ name: newColumnInput.name, color: newColumnInput.color, position: newColumnInput.position })
        })
            .then(res => {
                if (res.status === 201) {
                    getAllProjects(actualUser.userId, actualUser.token.version);
                    toggleModalNewColumn();
                    setNewColumnInput({ name: "", color: "white", position: "start"})
                } else {

                }
            })
    };

    /**
     * change active project and load it
     * 
     * @param id 
     */
    const changeProject = (id: string) => {

        const arr: Board[] = allBoards;
        const arrFinded: Board | undefined = arr.find(el => {
            return el.id === id
        })
        
        if (arrFinded !== undefined) {
            setActivProject(arrFinded);
            getAllColumns(arrFinded.id, actualUser.token.version);
        }
    };

    /**
     * toggle dark mod and light mod
     */
    const toggleDarkMod = () => {
        fetch(process.env.REACT_APP_API_URL + '/api/user/toggleDarkmod',{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + actualUser.token.version,
            },
            method: "PUT",
            body: JSON.stringify({ dark: !darkMod, userId: actualUser.userId })
        })
            .then(res => {
                if (res.status === 201) {
                    setDarkMod(!darkMod);
                    if (localStorage.getItem('react_kanban_token') !== null) {
                        let getToken = localStorage.getItem('react_kanban_token') || "";
                        let newObj = {
                            version: JSON.parse(getToken).version,
                            content: JSON.parse(getToken).content,
                            dark: !darkMod
                        };
                        localStorage.setItem('react_kanban_token', JSON.stringify(newObj)); 
                    }
                }
            })
        
    };

    /**
     * toggle display all boards
     */
    const toggleAllBoards = () => {
        if (allBoards.length > 4) {
            let arr: Board[] = [];
                
            if (displayAllBoard) {
                const newArr = allBoards;
                
                newArr.sort((a, b) => b.updatedAt - a.updatedAt);
                
                arr = newArr.slice(0, 4);
            } else {
                arr = allBoards;
            }
            
            setBoards(arr);
            setDisplayAllBoard(!displayAllBoard);
        }
    };

    /**
     * add subtask field to new task form
     */
    const addSubtaskField = () => {
        let arr = newTaskInput.subTasks;
        arr.push("");

        const newObj: NewTaskInput = {
            ...newTaskInput,
            subTasks: arr
        }
        setNewTaskInput(newObj); 
    };

    /**
     * remove subtask field to new task form
     */
    const removeSubtaskField = (ind: number) => {
        console.log("----------------");
        
        const arr = newTaskInput.subTasks;
        console.log(ind);
        console.log(arr);
        const arrFiltered = arr.filter((el, elInd) => {
            return elInd !== ind;
        });
        
        console.log(arrFiltered);
       const newObj: NewTaskInput = {
            ...newTaskInput,
            subTasks: arrFiltered
        }
        setNewTaskInput(newObj); 
    };

    return (
        <>
        <main className='home'>
            {/* side bar start */}
            <section className={darkMod ? "home__side home__side--dark" : "home__side home__side--light"}>
                <div className='home__side__top'>
                    <div className="home__side__top__titleCont">
                        <img className='home__side__top__titleCont__logo' src={appLogo} alt="app logo" />
                        <h1 className={darkMod ? "home__side__top__titleCont--dark" : ""}>react kanban</h1>
                    </div>
                    <div className="home__side__top__boards">
                        {
                            displayAllBoard ?
                            <p onClick={toggleAllBoards} className='home__side__top__boards__count'>Reduire les tableaux</p>
                            :
                            <p onClick={toggleAllBoards} className='home__side__top__boards__count'>Tous les tableaux ({ allBoards.length })</p>
                        }
                        <div className={displayAllBoard ? "home__side__top__boards__container home__side__top__boards__container--displayAll" : "home__side__top__boards__container"}>
                            {
                                boards.length > 0 ?
                                <>
                                {
                                    boards.map(el => {
                                        return (
                                            <div key={el.id} onClick={() => changeProject(el.id)} className={activProject.id === el.id ? "home__side__top__boards__container__board home__side__top__boards__container__board--activ" : "home__side__top__boards__container__board"}>
                                                <FontAwesomeIcon icon={faRectangleList} className="home__side__top__boards__container__board__img" />
                                                <p>{el.title}</p>
                                            </div>
                                        )
                                    })
                                }
                                </>
                                :
                                <h2 className='home__side__top__boards__container__nothing'>Aucun tableau</h2>
                            }
                        </div>
                        <div onClick={toggleModalNewBoard
                        } className="home__side__top__boards__addBtnCont">
                            <FontAwesomeIcon icon={faRectangleList} className="home__side__top__boards__addBtnCont__img" />
                            <p>Créer un nouveau tableau</p>
                        </div>
                    </div>
                </div>
                <div className="home__side__bot">
                    <div className={darkMod ? "home__side__bot__cont home__side__bot__cont--dark" : "home__side__bot__cont home__side__bot__cont--light"}>
                    <FontAwesomeIcon icon={faSun} className="home__side__bot__cont__img" />
                        <label className="home__side__bot__cont__darkModOption">
                            <input onChange={toggleDarkMod} checked={darkMod && true} type="checkbox" />
                            <span className="home__side__bot__cont__darkModOption__slider"></span>
                        </label>
                    <FontAwesomeIcon icon={faCloudMoon} className="home__side__bot__cont__img" />
                    </div>
                    <div className="home__side__bot__hideSide">
                        <FontAwesomeIcon icon={faEyeSlash} className="home__side__bot__hideSide__img" />
                        <p>Cacher onglet</p>
                    </div>
                </div>
            </section>
            {/* side bar ended */}
            <section className="home__right">
                <div className={darkMod ? "home__right__header home__right__header--dark" : "home__right__header home__right__header--light"}>
                    {
                        activProject.id !== "" &&
                        <>
                        <h2 className={darkMod ? "home__right__header__title home__right__header__title--dark" : "home__right__header__title home__right__header__title--light"}>{ activProject.title }</h2>
                        <div className='home__right__header__right'>
                            <input onClick={toggleModalNewTask} className='home__right__header__right__newBtn' type="button" value="Ajouter une tache" />
                            <FontAwesomeIcon icon={faEllipsisVertical} className="home__right__header__right__menuBtn" />
                            <div className="home__right__header__right__menu"></div>
                        </div>
                        </>
                    }
                </div>
                <div className={darkMod ? "home__right__main home__right__main--dark" : "home__right__main home__right__main--light"}>
                    <DndContext onDragEnd={handleOnDragEnd}>
                        
                        <div className="home__right__main__container">
                            {
                                columns.map((el, columnIndex) => {                                        
                                    return (
                                        
                                            <Column key={`column-${columnIndex}`} id={el.id} heading={el.name} darkMod={darkMod} elements={_.select(
                                                tasks,
                                                (elm) => elm,
                                                (f) => f.column === _.camel(el.id)
                                                )} columnsColor={el.color} />
                                    )
                                })
                            }
                            <div onClick={toggleModalNewColumn} className={darkMod ? "home__right__main__container__addBtn home__right__main__container__addBtn--dark" : "home__right__main__container__addBtn home__right__main__container__addBtn--light"}>
                                <p>Ajouter Colonne</p>
                            </div>
                        </div>
                    </DndContext>
                </div>
            </section>
        </main>
        {/* modal new board start */}
        {
            toggleNewBoardModal &&
            <div className="home__modalNewBoard">
                <div className={darkMod ? "home__modalNewBoard__modal home__modalNewBoard__modal--dark" : "home__modalNewBoard__modal home__modalNewBoard__modal--light"}>
                    <input className='home__modalNewBoard__modal__closeBtn' onClick={toggleModalNewBoard} type="button" value="X" />
                    <h2>Ajouter un tableau</h2>
                    <div className='home__modalNewBoard__modal__errorCont'></div>
                    <form className='home__modalNewBoard__modal__form' onSubmit={validateNewBoard}>
                        <div className="home__modalNewBoard__modal__form__inputCont">
                            <label htmlFor="newBoardTitle">Titre *</label>
                            <input onInput={(e) => ctrlNewBoardInput("title", (e.target as HTMLInputElement).value)} value={newBoardInput.title} type="text" id="newBoardTitle" placeholder='e.g. Créer un potager' />
                        </div>
                        <div className="home__modalNewBoard__modal__form__inputCont">
                            <label htmlFor="newBoardDescription">Description</label>
                            <textarea onInput={(e) => ctrlNewBoardInput("description", (e.target as HTMLInputElement).value)} value={newBoardInput.description} id="newBoardDescription" placeholder='e.g. Un potager complet avec tomates, courgettes et aubergines.'/>
                        </div>
                        <input className='home__modalNewBoard__modal__form__submitBtn' type="submit" value="Créer tableau" />
                    </form>
                </div>
            </div>
        }
        {/* modal new board ended */}
        {/* modal new column start */}
        {
            toggleNewColumnModal &&
            <div className="home__modalNewColumn">
                <div className={darkMod ? "home__modalNewColumn__modal home__modalNewColumn__modal--dark" : "home__modalNewColumn__modal home__modalNewColumn__modal--light"}>
                    <input className='home__modalNewColumn__modal__closeBtn' onClick={toggleModalNewColumn} type="button" value="X" />
                    <h2>Ajouter une colonne</h2>
                    <div className='home__modalNewColumn__modal__errorCont'></div>
                    <form className='home__modalNewColumn__modal__form' onSubmit={validateNewColumn}>
                        <div className="home__modalNewColumn__modal__form__inputCont">
                            <label htmlFor="newColumnTitle">Nom de la colonne *</label>
                            <input onInput={(e) => ctrlNewColInput("name", (e.target as HTMLInputElement).value)} value={newColumnInput.name} placeholder="e.g. Test" type="text" id="newColumnTitle" />
                        </div>
                        <div className="home__modalNewColumn__modal__form__colOptions">
                            <div className="home__modalNewColumn__modal__form__colOptions__color">
                                <label htmlFor="newColumnColor">Couleur</label>
                                <input onInput={(e) => ctrlNewColInput("color", (e.target as HTMLInputElement).value)} value={newColumnInput.color} type="color" id="newColumnColor" />
                            </div>
                            <div className="home__modalNewColumn__modal__form__colOptions__position">
                                <label htmlFor="newColumnSelect">position</label>
                                <select onChange={(e) => ctrlNewColInput("position", (e.target as HTMLSelectElement).value)} value={newColumnInput.position} className={darkMod ? 'home__modalNewColumn__modal__form__colOptions__position__select home__modalNewColumn__modal__form__colOptions__position__select--dark' : "home__modalNewColumn__modal__form__colOptions__position__select home__modalNewColumn__modal__form__colOptions__position__select--light"} id="newColumnSelect">
                                    <option value="start">Au début</option>
                                    {
                                        columns.map((el, colInd) => {
                                            return <option key={'col' + colInd} value={colInd}>Après { el.name }</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <input className='home__modalNewColumn__modal__form__submitBtn' type="submit" value="Ajouter une colonne" />
                    </form>
                </div>
            </div>
        }
        {/* modal new column ended */}
        {/* modal new task start */}
        {
            toggleNewTaskModal &&
            <div className="home__modalNewTask">
                <div className={darkMod ? "home__modalNewTask__modal home__modalNewTask__modal--dark" : "home__modalNewTask__modal home__modalNewTask__modal--light"}>
                    <input className='home__modalNewTask__modal__closeBtn' onClick={toggleModalNewTask} type="button" value="X" />
                    <h2>Ajouter une tache</h2>
                    <div className='home__modalNewTask__modal__errorCont'></div>
                    <form className='home__modalNewTask__modal__form' onSubmit={validateNewTask}>
                        <div className="home__modalNewTask__modal__form__inputCont">
                            <label htmlFor="newTaskTitle">Titre *</label>
                            <input onInput={(e) => ctrlNewTaskInput("title", (e.target as HTMLInputElement).value)} value={newTaskInput.title} type="text" id="newTaskTitle" placeholder='e.g. Planter des tomates' />
                        </div>
                        <div className="home__modalNewTask__modal__form__inputCont">
                            <label htmlFor="newTaskDescription">Description</label>
                            <textarea onInput={(e) => ctrlNewTaskInput("description", (e.target as HTMLInputElement).value)} value={newTaskInput.description} id="newTaskDescription" placeholder='e.g. Faire un trou de minimum 20cm.'/>
                        </div>
                        <div className="home__modalNewTask__modal__form__checkList">
                            <label htmlFor="newTaskCheckList">Check-list</label>
                            <div className='home__modalNewTask__modal__form__checkList__cont' id='newTaskCheckList'>
                                {
                                    newTaskInput.subTasks.map((el, elInd) => {
                                        return <div key={"task" + elInd} className='home__modalNewTask__modal__form__checkList__cont__inputCont'>
                                            <input onInput={(e) => ctrlNewTaskInput("subTask", (e.target as HTMLInputElement).value, elInd)} value={el} type="text" placeholder='e.g. creuser un trou.' />
                                            <div className="home__modalNewTask__modal__form__checkList__cont__inputCont__closeCont">
                                                <FontAwesomeIcon onClick={(e) => removeSubtaskField(elInd)} icon={faXmark} className="home__modalNewTask__modal__form__checkList__cont__inputCont__closeCont__closeBtn" />
                                            </div>
                                        </div>
                                    })
                                }
                                <input onClick={addSubtaskField} className={darkMod ? "home__modalNewTask__modal__form__checkList__cont__addSubBtn home__modalNewTask__modal__form__checkList__cont__addSubBtn--dark" : "home__modalNewTask__modal__form__checkList__cont__addSubBtn home__modalNewTask__modal__form__checkList__cont__addSubBtn--light"} type="button" value="Ajouter une sous tache" />
                            </div>
                        </div>
                        <div className="home__modalNewTask__modal__form__status">
                            <label htmlFor="">Status</label>
                            <select onChange={(e) => ctrlNewTaskInput("status", (e.target as HTMLSelectElement).value)} value={newTaskInput.status} className={darkMod ? "home__modalNewTask__modal__form__status__select home__modalNewTask__modal__form__status__select--dark" : "home__modalNewTask__modal__form__status__select home__modalNewTask__modal__form__status__select--light"} id="">
                                {
                                    columns.map((el, elInd) => {
                                        return <option key={"opt" + elInd} value={elInd}>{el.name}</option>
                                    })
                                }
                            </select>
                        </div>
                        <input className='home__modalNewTask__modal__form__submitBtn' type="submit" value="Créer tache" />
                    </form>
                </div>
            </div>
        }
        {/* modal new task ended */}
        </>
    );
};

export default Home;