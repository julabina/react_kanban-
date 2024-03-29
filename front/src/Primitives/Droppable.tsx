import { FC, ReactNode, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

interface IDroppable {
  id: string;
  children: ReactNode;
}

const Droppable: FC<IDroppable> = ({ id, children }) => {
    
    const { isOver, setNodeRef } = useDroppable({ id });        

    const style = useMemo(
        () => ({
        opacity: isOver ? 0.5 : 1,
        backgroundColor: isOver ? "#3f3f3f2d" : ""
        }),
        [isOver]
    );

    return (
        <div ref={setNodeRef} style={style} className="droppable">
            {children}
        </div>
    );
};

export default Droppable;