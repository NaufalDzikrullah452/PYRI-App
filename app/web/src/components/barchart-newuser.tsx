import React from 'react'
import { Bar, defaults } from 'react-chartjs-2'

const BarChart = () => {
    return (
        <div>
            <Bar
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                }}
                data={{
                    labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                    datasets: [
                        {
                            label: '# of Votes',
                            data: [1200, 190, 30, 500, 200, 30, 100, 100, 200, 700, 607, 800],
                            backgroundColor: '#ffbe76',
                            borderRadius: 0,
                        },
                    ],
                }}
            />
        </div>
    )
}

export default BarChart