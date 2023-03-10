import { useDraggable } from "@dnd-kit/core";
import { FC, ReactNode, useMemo } from "react";

interface IDraggable {
    id: string;
    children: ReactNode;
  }

const Draggable: FC<IDraggable> = ({ id, children }) => {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    const style = useMemo(() => {
        if (transform) {
        return {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        };
        }
        return undefined;
    }, [transform]);

    const test = () => {
        console.log("test" + id);
      };

    return (
        <>
        <div>
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                {children}
            </div>
            <input onClick={test}  style={style} type="button" value="TEST" />
        </div>
        </>
    );
};

export default Draggable;