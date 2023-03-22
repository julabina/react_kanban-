import { FC, useEffect, useMemo, useState } from "react";

import Draggable from "../Primitives/Draggable";

interface IDraggableElement {
  identifier: string;
  content: string;
  description: string;
  checkTasks: string[];
  subTasks: string[];
  darkMod: boolean;
  columnId: string;
  getAllProject: () => void;
  token: string;
}
const DraggableElement: FC<IDraggableElement> = ({
    identifier,
    content,
    description,
    checkTasks,
    subTasks,
    darkMod,
    getAllProject,
    token,
    columnId
  }) => {
    const itemIdentifier = useMemo(() => identifier, [identifier]);

    const [taskDone, setTaskDone] = useState<number>(0);

    useEffect(() => {
      if (checkTasks.length > 0) {
          let count = 0;

          for (let i = 0; i < checkTasks.length; i++) {
              if (checkTasks[i] === 'true') {
                  count++;
              }
          }

          setTaskDone(count);
      }
    },[checkTasks]);
    
    return (
      <>
        <Draggable id={itemIdentifier} darkMod={darkMod} content={content} description={description} subTasks={subTasks} checkTasks={checkTasks} getAllProject={() => getAllProject()} token={token}>
            <div className={darkMod ? "draggableElement draggableElement--dark" : "draggableElement draggableElement--light"}>
                <h3>{ content }</h3>
                {
                  subTasks[0] !== "" ?
                  <p>{ taskDone } sur {subTasks.length} sous taches.</p>
                  :
                  <p>Aucune sous taches.</p>
                }
            </div>
        </Draggable>
      </>
    );
};

export default DraggableElement;