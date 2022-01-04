import React from 'react'
import { Line, defaults } from 'react-chartjs-2'

const LineChart = (x) => {
    const idata = x.data;
    return (
        <div>
            <Line
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                }}
                data={idata}
            />
        </div>
    )
}

export default LineChart