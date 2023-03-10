const { v4 } = require('uuid');
const { Project, Column, Task } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create one column for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.create = (req, res, next) => {
    if (req.body.name === undefined || req.body.color === undefined || req.body.position === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } 
    
    Project.findOne({ where: { id: req.params.id } })
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authorisée.";
                return res.status(403).json({ message });
            }
            const actualArr = project.columns;   
            let colArr = [];

            let column = new Column({
                projectId: project.id,
                name: req.body.name,
                color: req.body.color
            });

            column.save()
                .then(() => {

                    if (req.body.position === "start") {
                        colArr.push(column.id);
                    }
        
                    for (let i = 0; i < actualArr.length; i++) {
                        if (req.body.position !== "start" && (parseInt(req.body.position) + 1) === i ) {
                            colArr.push(column.id);
                        }
                        
                        colArr.push(actualArr[i]);
                    }
                    if ((parseInt(req.body.position) + 1) === actualArr.length) {
                        colArr.push(column.id);
                    }
        
                    project.columns = colArr;

                    project.save()
                        .then(() => {
                            const message = "Colonne bien ajoutée.";
                            res.status(201).json({ message });
                        })     
                        .catch(error => {
                            Column.destroy({ where: { id: column.id } })
                                .then(() => {
                                    if (error instanceof ValidationError) {
                                        return res.status(401).json({ message: error.message, data: error }); 
                                    }
                                    if (error instanceof UniqueConstraintError) {
                                        return res.status(401).json({ message: error.message, data: error });
                                    }
                                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne.", error });
                                })
                                .catch(error => res.status(500).json({ message: error }));
                        });   
                })   
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne.", error });
                });       
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * get all columns and tasks for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    Project.findOne({ where: { id: req.params.id } })
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authorisée.";
                return res.status(403).json({ message });
            }
            
            Column.findAll({ where: { projectId: project.id } })
                .then(columns => {
                    if (columns === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }

                    Task.findAll({ where: { projectId: project.id } })
                        .then(tasks => {
                            let message = "Aucune tache trouvé.";

                            const columnsSorted = [];
                            const colProject = project.columns;

                            for (let i = 0; i < colProject.length; i++) {
                                const arrFiltered = columns.filter(el => {
                                    return el.id === parseInt(colProject[i])
                                });
                                columnsSorted.push(arrFiltered[0]);
                            }

                            let data = [columnsSorted];

                            if (tasks !== null) { 
                                if (tasks.length > 1) {
                                    message = "Des taches ont bien été trouvées.";
                                } else {
                                    message = "Une tache a bien été trouvée.";
                                }

                                data.push(tasks);
                            }

                            res.status(200).json({ message, data });
                        })
                        .catch(error => res.status(500).json({ message: error }));
                })
                .catch(error => res.status(500).json({ message: error }));       
        })
        .catch(error => res.status(500).json({ message: error }));       
};