import appLogo from '../assets/logo.png';

const Home = () => {
    return (
        <main className='home'>
            <section className="home__side">
                <div className='home__side__top'>
                    <div className="home__side__top__titleCont">
                        <img className='home__side__top__titleCont__logo' src={appLogo} alt="app logo" />
                        <h1>React Kanban</h1>
                    </div>
                    <div className="home__side__top__boards">
                        <p className='home__side__top__boards__count'></p>
                        <div className="home__side__top__boards__container"></div>
                        <div className="home__side__top__boards__addBtnCont">
                            <p>Créer un nouveau tableau</p>
                        </div>
                    </div>
                </div>
                <div className="home__side__bot">
                    <div className="home__side__bot__darkModOption">

                    </div>
                    <div className="home__side__bot__hideSide">
                        <p>Cacher onglet</p>
                    </div>
                </div>
            </section>
            <section className="home__right">
                <div className="home__right__header">
                    <h1>TITRE</h1>
                    <div className='home__right__header__right'>
                        <input className='home__right__header__right__newBtn' type="button" value="Ajouter une tache" />
                        <input className='home__right__header__right__menuBtn' type="button" value="..." />
                        <div className="home__right__header__right__menu"></div>
                    </div>
                </div>
                <div className="home__right__main">
                    
                </div>
            </section>
        </main>
    );
};

export default Home;