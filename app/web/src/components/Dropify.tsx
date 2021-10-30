import { useEffect } from "react"

export default () => {
    setTimeout(() => {
        (window as any).$('.dropify').dropify();
    })

    return (
        <input type="file" className="dropify" data-max-file-size="3M" />
    )
}