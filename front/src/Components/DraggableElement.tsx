import { FC, useMemo } from "react";

import Draggable from "../Primitives/Draggable";

interface IDraggableElement {
  identifier: string;
  content: string;
  darkMod: boolean;
}
const DraggableElement: FC<IDraggableElement> = ({
    identifier,
    content,
    darkMod
  }) => {
    const itemIdentifier = useMemo(() => identifier, [identifier]);

    return (
        <Draggable id={itemIdentifier}>
          <div className={darkMod ? "draggableElement draggableElement--dark" : "draggableElement draggableElement--light"}>
              <h3>{ content }</h3>
              <p>0 of 3 sous taches.</p>
          </div>
        </Draggable>
    );
};

export default DraggableElement;