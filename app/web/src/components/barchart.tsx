import React from 'react'
import { Bar, defaults } from 'react-chartjs-2'

const BarChart = (x) => {
    const idata = x.data;
    return (
        <div>
            <Bar
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                }}
                data={idata}
            />
        </div>
    )
}

export default BarChart