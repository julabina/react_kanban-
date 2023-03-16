import { useEffect, useState } from 'react';

const NotFound = () => {

    const [darkMod, setDarkMod] = useState<boolean>(false);

    useEffect(() => {
        if (localStorage.getItem('react_kanban_token') !== null) {
            let getToken = localStorage.getItem('react_kanban_token') || "";
        
            if (JSON.parse(getToken).dark === true) {
                setDarkMod(true);
            }
        }
    },[]);

    return (
        <main className={darkMod ? "notFound notFound--dark" : "notFound notFound--light"}>
            <h1>404 Page introuvable</h1>
            <a href="/"><h2>Retour</h2></a>
        </main>
    );
};

export default NotFound;