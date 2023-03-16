import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { faEllipsis, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Profil = () => {

    const navigate = useNavigate();

    type StoredToken = {version: string, content: string};
    type Token = {version: string, content: string};
    type DecodedToken = {userId: string, token: Token};
    type Board = {id: string, title: string, description: string, columns: string[], updatedAt: number};
    type ModalInfos = {id: string, title: string, description: string};

    const [actualUser, setActualUser] = useState<DecodedToken>({ userId: "", token: {version: "", content: ""} });
    const [darkMod, setDarkMod] = useState<boolean>(false);
    const [boards, setBoards] = useState<Board[]>([]);
    const [toggleMenuModal, setToggleMenuModal] = useState<boolean>(false);
    const [toggleDeleteModal, setToggleDeleteModal] = useState<boolean>(false);
    const [toggleModifInput, setToggleModifInput] = useState<boolean>(false);
    const [modalInfos, setModalInfos] = useState<ModalInfos>({ id: "", description: "", title: "" });

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
                
                setDarkMod(JSON.parse(getToken).dark)
                setActualUser(user);
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
    },[])

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
                            description: data.data[i].description,
                            columns: data.data[i].columns,
                            updatedAt: Math.floor((new Date(data.data[i].updatedAt)).getTime() / 1000)
                        };

                        newArr.push(newObj);
                    }
                    
                    newArr.sort((a, b) => b.updatedAt - a.updatedAt);
                
                    setBoards(newArr);
                }
            })
    };

    const openModal = (ind: number) => {
        const obj: Board = boards[ind];

        setModalInfos({ id: obj.id, title: obj.title, description: obj.description });
        toggleMenu();
    };

    const toggleMenu = () => {
        setToggleMenuModal(!toggleMenuModal);
        if (toggleModifInput) {
            setToggleModifInput(false);
        }
    };

    const toggleModif = () => {
        setToggleModifInput(!toggleModifInput);
    };

    const toggleDelete = () => {
        console.log("erererrerererer");
        setToggleDeleteModal(!toggleDeleteModal);
    };

    const ctrlModifInput = (action: string, value: string) => {

    };

    const validateModif = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


    };

    const deleteProject = (id: string) => {

    };

    return (
        <>
        <main className={darkMod ? "profil profil--dark" : "profil profil--light"}>
            <a href="/"><input className='profil__backBtn' type="button" value="Retour" /></a>
            <section>
                {
                    boards.length > 0 ?
                        <>
                        <h1>Mes projets</h1>
                        <div className='profil__section__projectCont'>
                        {
                            boards.map((el, elInd) => {
                                return (
                                    <div key={"projectProfil" + elInd} onClick={() => openModal(elInd)} className="profil__section__projectCont__project">
                                        <FontAwesomeIcon icon={faEllipsis} className="profil__section__projectCont__project__menuBtn" />
                                        <h2>{el.title}</h2>
                                        {
                                            el.description !== "" &&
                                            <p>{el.description}</p>
                                        }
                                    </div>
                                )
                            })
                        }
                        </div>
                        </>
                    :
                        <h1>Aucun projet</h1>
                }
            </section>
        </main>
        {
            toggleMenuModal &&
                <div className="profil__modalMenu">
                {
                    toggleDeleteModal ?
                    <div className={darkMod ? "profil__modalMenu__modal profil__modalMenu__modal--dark" : "profil__modalMenu__modal profil__modalMenu__modal--light"}>
                        <h2>Supprimer le projet { modalInfos.title } ?</h2>
                        <p className="column__menu__modal__alertDeleteConfirm">Cette action est irréversible !</p>
                        <div className="column__menu__modal__btnsConfirm">
                            <input id="confirmDelete" onClick={() => deleteProject(modalInfos.id)} type="button" value="Supprimer" />
                            <input onClick={toggleDelete} type="button" value="Annuler" />
                        </div>
                    </div>
                    :
                    <div className={darkMod ? "profil__modalMenu__modal profil__modalMenu__modal--dark" : "profil__modalMenu__modal profil__modalMenu__modal--light"}>
                    <input className='profil__modalMenu__modal__closeBtn' onClick={toggleMenu} type="button" value="X" />
                        {
                            toggleModifInput ?
                            <form className='profil__modalMenu__modal__form' onSubmit={validateModif}>
                                <div className="profil__modalMenu__modal__form__inputCont">
                                    <label htmlFor="profilModifTitle">Nom du projet</label>
                                    <input type="text" id="profilModifTitle" />
                                </div>
                                <div className="profil__modalMenu__modal__form__inputCont">
                                    <label htmlFor="profilModifDescr">Description</label>
                                    <textarea id="profilModifDescr"></textarea>
                                </div>
                                <div className="profil__modalMenu__modal__form__btnCont">
                                    <input type="submit" value="Changer" />
                                    <input onClick={toggleModif} type="button" value="Annuler" />
                                </div>
                            </form>
                            :
                            <div className="profil__modalMenu__modal__main">
                                <div className="profil__modalMenu__modal__main__title">
                                    <h2>{modalInfos.title}</h2>
                                    <FontAwesomeIcon className='profil__modalMenu__modal__main__title__icon' onClick={toggleModif} icon={faPencil} />
                                </div>
                                <p>{modalInfos.description}</p>
                            </div>
                        }
                        <div onClick={toggleDelete} className='profil__modalMenu__modal__deleteBtn'>
                            <input type="button" value="Supprimer le projet" />
                        </div>
                    </div>
                }
                </div>
        }
        </>
    );
};

export default Profil;