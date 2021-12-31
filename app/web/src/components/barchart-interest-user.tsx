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
                    labels: ['Genre 1', 'Genre 2', 'Genre 3', 'Genre 3', 'Genre 4', 'Genre 5'],
                    datasets: [
                        {
                            label: '# of Votes',
                            data: [120, 190, 30, 50, 20, 30],
                            backgroundColor: '#fdcb6e',
                            borderRadius: 0,
                        },
                    ],
                }}
            />
        </div>
    )
}

export default BarChart