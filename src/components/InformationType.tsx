import React from "react"
import "../style.scss";

interface InformationTypeProps {
    title: string;
    content: string;
    tooltip: string;
    editing: boolean;
    onClick: () => void;
    onEdit: (content: string) => void;
}

export default function InformationType(props: InformationTypeProps): JSX.Element {
    const {title, content, tooltip, editing, onClick, onEdit} = props

    const renderContent = (content: string, editing: boolean) => {
        if (editing) {
            return <textarea className="form-control width-full" onChange={(e) => onEdit(e.target.value)}>{content}</textarea>
        }
        return <p>{content}</p>
    }

    const onNonEditClick = () => {
        if (!editing){
            onClick()
        }
    }

    return (
        <div className="Box-body" onClick={onNonEditClick}>
          <div className="tooltipped tooltipped-se" aria-label={tooltip}>
            <h4>{title}</h4>
          </div>
          {renderContent(content, editing)}
        </div>
      );
}