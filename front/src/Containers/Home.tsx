import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { faRectangleList, faSun } from '@fortawesome/free-regular-svg-icons';
import { faCloudMoon, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import appLogo from '../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Home = () => {

    const navigate = useNavigate();

    type StoredToken = {version: string, content: string};
    type Token = {version: string, content: string};
    type DecodedToken = {userId: string, token: Token};
    type NewBoardInput = {title: string, description: string};
    type Board = {id: string, title: string, updatedAt: number}

    const [actualUser, setActualUser] = useState<DecodedToken>({ userId: "", token: {version: "", content: ""} });
    const [toggleNewBoardModal, setToggleNewBoardModal] = useState<boolean>(false);
    const [newBoardInput, setNewBoardInput] = useState<NewBoardInput>({ title: "", description: "" });
    const [boards, setBoards] = useState<Board[]>([]);
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [activProject, setActivProject] = useState<Board>({id: "", title: "", updatedAt: 0});
    const [darkMod, setDarkMod] = useState<boolean>(false);

    const newBoardErrorCont = document.querySelector('.home__modalNewBoard__modal__errorCont');

    useEffect(() => {
        console.log("1");
        
        if (localStorage.getItem('react_kanban_token') !== null) {
            let getToken = localStorage.getItem('react_kanban_token') || "";
            
            const tokenObj: StoredToken = {
                version: JSON.parse(getToken).version,
                content: JSON.parse(getToken).content
            }
            
            console.log("2", getToken);
            let token: StoredToken = tokenObj;
            if (token !== null) {
                console.log("3");
                let decodedToken: DecodedToken = decodeToken(token.version) || {userId: "",token: {version: "", content: ""}};
                let isTokenExpired = isExpired(token.version);
                console.log("decodedToken", decodedToken);
                console.log("dec", decodedToken.userId);
                console.log("tok", token.content );
                if (decodedToken.userId !== token.content || isTokenExpired === true) {
                    console.log("4");
                    // DISCONNECT
                    localStorage.removeItem('react_kanban_token');
                    return navigate('/connexion', { replace: true });
                };
                
                const user: DecodedToken = {userId: decodedToken.userId, token};
                
                setActualUser(user);
                setDarkMod(JSON.parse(getToken).dark)
                getAllProjects(user.userId, user.token.version);
                
            } else {
                console.log("5");
                // DISCONNECT
                localStorage.removeItem('react_kanban_token');
                navigate('/connexion', { replace: true });
            };
        } else {
            console.log("6");
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
                            updatedAt: Math.floor((new Date(data.data[i].updatedAt)).getTime() / 1000)
                        };

                        newArr.push(newObj);
                    }
                    
                    newArr.sort((a, b) => b.updatedAt - a.updatedAt);
                
                    const firstBoard = newArr.slice(0, 4);

                    setBoards(firstBoard);                    
                    setAllBoards(newArr);
                    setActivProject(firstBoard[0]);
                }
            })
    };

    /**
     * toggle modal for create new board
     */
    const toggleModalNewBoard = () => {
        setToggleNewBoardModal(!toggleNewBoardModal);
    };

    /**
     * create new board on database
     */
    const tryToCreateNewBoard = () => {
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

        console.log('test');            
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
     * change active project and load it
     * 
     * @param id 
     */
    const changeProject = (id: string) => {

        const arr: Board[] = allBoards;
        const test: Board | undefined = arr.find(el => {
            return el.id === id
        })
        
        if (test !== undefined) {
            setActivProject(test);
        }
    };

    const changeDarkMod = () => {
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
                        <p className='home__side__top__boards__count'>Tous les tableau ({ allBoards.length })</p>
                        <div className="home__side__top__boards__container">
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
                                <h2>Aucun tableau</h2>
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
                            <input onChange={changeDarkMod} checked={darkMod && true} type="checkbox" />
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
                <div className="home__right__header">
                    {
                        activProject.id !== "" &&
                        <>
                        <h2>{ activProject.title }</h2>
                        <div className='home__right__header__right'>
                            <input className='home__right__header__right__newBtn' type="button" value="Ajouter une tache" />
                            <input className='home__right__header__right__menuBtn' type="button" value="..." />
                            <div className="home__right__header__right__menu"></div>
                        </div>
                        </>
                    }
                </div>
                <div className="home__right__main">
                    
                </div>
            </section>
        </main>
        {/* modal new board start */}
        {
            toggleNewBoardModal &&
            <div className="home__modalNewBoard">
                <div className="home__modalNewBoard__modal">
                    <input onClick={toggleModalNewBoard} type="button" value="X" />
                    <h2>Ajouter un tableau</h2>
                    <div className='home__modalNewBoard__modal__errorCont'></div>
                    <form className='home__modalNewBoard__modal__form' onSubmit={validateNewBoard}>
                        <div className="home__modalNewBoard__modal__form__inputCont">
                            <label htmlFor="newBoardTitle">Titre *</label>
                            <input onInput={(e) => ctrlNewBoardInput("title", (e.target as HTMLInputElement).value)} value={newBoardInput.title} type="text" id="newBoardTitle" />
                        </div>
                        <div className="home__modalNewBoard__modal__form__inputCont">
                            <label htmlFor="newBoardDescription">Description</label>
                            <input onInput={(e) => ctrlNewBoardInput("description", (e.target as HTMLInputElement).value)} value={newBoardInput.description} type="text" id="newBoardDescription" />
                        </div>
                        <input className='home__modalNewBoard__modal__form__submitBtn' type="submit" value="Créer tableau" />
                    </form>
                </div>
            </div>
        }
        {/* modal new board ended */}
        </>
    );
};

export default Home;