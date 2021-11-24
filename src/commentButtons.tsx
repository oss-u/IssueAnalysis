import React from "react";

class CommentButtons extends React.Component<
    {},
    {}
> {
    render() {
        return (
            <div className="clearfix my-6">
                <div className="offset-1 col-10">
                    <button className="btn btn-large btn-primary float-left" type="button">Add to existing summary</button>
                    <button className="btn btn-large btn-primary float-right" type="button">Generate new summary</button>
                </div>
            </div>);
    }
}

export default CommentButtons;
