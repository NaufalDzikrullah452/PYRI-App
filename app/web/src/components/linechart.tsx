import React from 'react'
import { Line, defaults } from 'react-chartjs-2'

const LineChart = (x) => {
    const idata = x.data;
    return (
        <div>
            <Line
                width={"1000%"}
                height={"250%"}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                }}
                data={idata}
            />
        </div>
    )
}

export default LineChart