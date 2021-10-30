import { useEffect } from "react"

export default ({ onChange }) => {
  setTimeout(() => {
    (window as any).$('.dropify').dropify();
    // console.log($);
  })

  return (
    <input type="file" className="dropify" data-max-file-size="3M" onChange={onChange} />
  )
}