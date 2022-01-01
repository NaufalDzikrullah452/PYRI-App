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
                            label: 'Transaction Subscription',
                            data: [1200, 190, 30, 500, 200, 30, 100, 100, 200, 700, 607, 800],
                            borderColor: '#6ab04c',
                            // backgroundColor: '#f0932b',
                            pointBackgroundColor: '#ffffff',
                            pointRadius: 2,
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