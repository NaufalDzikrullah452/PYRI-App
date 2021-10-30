const $ = require('jquery');
import "./js/dropify.min.js"

export default (onChange) => {
  setTimeout(() => {
    $('.dropify').dropify();
  })

  return (
    <input type="file" className="dropify" data-max-file-size="3M" onChange={onChange} />
  )
}