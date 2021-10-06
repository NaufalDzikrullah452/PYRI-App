import { useEffect } from "react";
import { BaseWindow } from "web.init/src/window";

var $ = require('jquery');
require('datatables.net')(window, $);
declare const window: BaseWindow

export default () => {
    window.db.parent.findMany().then((res) => {
        $('#dtable').DataTable({
            data: res,
            aoColumns: [
                { mData: 'id' },
                { mData: 'sample_1' },
            ]
        });

    })

    return (
        <div>
            <table className="display" id="dtable">
                <thead>
                    <tr>
                        <th>id</th>
                        <th>Nama</th>
                    </tr>
                </thead>
            </table>
        </div>
    )
}