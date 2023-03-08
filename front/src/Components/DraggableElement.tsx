import { FC, useMemo } from "react";

import Draggable from "../Primitives/Draggable";

interface IDraggableElement {
  identifier: string;
  content: string;
}
const DraggableElement: FC<IDraggableElement> = ({
    identifier,
    content,
  }) => {
    const itemIdentifier = useMemo(() => identifier, [identifier]);

    return (
        <Draggable id={itemIdentifier}>
        <div className="elWrapper">
            <h3>{ content }</h3>
        </div>
        </Draggable>
    );
};

export default DraggableElement;