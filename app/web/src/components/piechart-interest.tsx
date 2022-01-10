import React from 'react'
import { Pie, defaults } from 'react-chartjs-2'

export default (x) => {
    const idata = x.data;
    return (
        <div>
            <Pie
                data={idata}
            />
        </div>
    )
}
