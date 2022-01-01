import React from 'react'
import { Line, defaults } from 'react-chartjs-2'

const LineChart = () => {
    return (
        <div>
            <Line
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                }}
                data={{
                    labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                    datasets: [
                        {
                            label: 'Subscription Active',
                            data: [1200, 190, 30, 500, 200, 30, 100, 100, 200, 700, 607, 800],
                            borderColor: '#f0932b',
                            // backgroundColor: '#312e8115',
                            pointBackgroundColor: '#ffffff',
                            pointRadius: 1,
                            pointHoverRadius: 7,
                            borderWidth: 2,
                            // tension:0.2
                        },
                    ],
                }}
            />
        </div>
    )
}

export default LineChart