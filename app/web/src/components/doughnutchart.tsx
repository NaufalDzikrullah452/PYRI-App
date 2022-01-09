import React from 'react'
import { Doughnut, defaults } from 'react-chartjs-2'

export default (x) => {
    const idata = x.data;
    return (
        <div>
            <Doughnut
                data={idata}
                width={"250%"}
                options={{ maintainAspectRatio: false }}
            />
        </div>
    )
}
