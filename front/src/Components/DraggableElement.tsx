import { FC, useMemo } from "react";

import Draggable from "../Primitives/Draggable";

interface IDraggableElement {
  identifier: string;
  content: string;
  checkTasks: string[];
  subTasks: string[];
  darkMod: boolean;
  columnId: string;
}
const DraggableElement: FC<IDraggableElement> = ({
    identifier,
    content,
    checkTasks,
    subTasks,
    darkMod,
    columnId
  }) => {
    const itemIdentifier = useMemo(() => identifier, [identifier]);
    
    return (
      <>
        <Draggable id={itemIdentifier} darkMod={darkMod} content={content} subTasks={subTasks} checkTasks={checkTasks}>
            <div className={darkMod ? "draggableElement draggableElement--dark" : "draggableElement draggableElement--light"}>
                <h3>{ content }</h3>
                {
                  subTasks[0] !== "" ?
                  <p>0 sur {subTasks.length} sous taches.</p>
                  :
                  <p>Aucune sous taches.</p>
                }
            </div>
        </Draggable>
      </>
    );
};

export default DraggableElement;