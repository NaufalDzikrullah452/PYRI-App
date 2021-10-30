import { useEffect } from "react";
import { BaseWindow } from "web.init/src/window";

require('datatables.net')(window, (window as any).$);
declare const window: BaseWindow

export default () => {
    window.db.parent.findMany().then((res) => {
        (window as any).$('#dtable').DataTable({
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