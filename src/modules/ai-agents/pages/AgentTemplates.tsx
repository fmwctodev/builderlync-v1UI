import { Search, Star } from 'lucide-react';

export function AgentTemplates() {
  const agents = [
    {
      name: 'Inbound Roofing Agent',
      subtitle: 'Roofing Lead Qualification & Appointment Booking',
      installs: '8.2K',
      author: 'BuilderLync',
      description: 'AI agent specialized in qualifying roofing leads, scheduling inspections, and handling storm damage inquiries.',
      rating: 5,
      reviews: 47,
      price: 'Free'
    },
    {
      name: 'Outbound Roofing Agent',
      subtitle: 'Proactive Roofing Sales & Follow-up',
      installs: '6.8K',
      author: 'BuilderLync',
      description: 'Automated outbound calling for roofing prospects, follow-ups on estimates, and re-engagement campaigns.',
      rating: 4,
      reviews: 32,
      price: 'Free'
    },
    {
      name: 'Inbound Solar Agent',
      subtitle: 'Solar Lead Qualification & Energy Assessment',
      installs: '5.4K',
      author: 'BuilderLync',
      description: 'Specialized AI for solar inquiries, energy bill analysis, and solar consultation scheduling.',
      rating: 5,
      reviews: 28,
      price: 'Free'
    },
    {
      name: 'Outbound Solar Agent',
      subtitle: 'Solar Sales & Energy Savings Outreach',
      installs: '4.1K',
      author: 'BuilderLync',
      description: 'Proactive solar sales agent for energy savings consultations and solar proposal follow-ups.',
      rating: 4,
      reviews: 19,
      price: 'Free'
    },
    {
      name: 'Construction Support Agent',
      subtitle: 'General Construction & Contractor Services',
      installs: '3.2K',
      author: 'BuilderLync',
      description: 'Multi-purpose construction AI for general contracting, home improvement, and service inquiries.',
      rating: 4,
      reviews: 15,
      price: 'Free'
    },
    {
      name: 'Emergency Response Agent',
      subtitle: 'Storm Damage & Emergency Roofing Services',
      installs: '2.8K',
      author: 'BuilderLync',
      description: 'Specialized agent for handling emergency roofing calls, storm damage assessments, and urgent repairs.',
      rating: 5,
      reviews: 12,
      price: 'Free'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button className="px-4 py-2 bg-red-600 text-white rounded-md">All</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Roofing</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Solar</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Siding</button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for agents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Agents</h3>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {/* <span>Categories</span>
              <span>Use Cases</span>
              <span>Business Niche</span>
              <span>Pricing</span>
              <span>Actions</span>
              <span>Agent Contains</span>
              <span>Who can install the app?</span> */}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {agents.map((agent, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{agent.subtitle}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{agent.installs}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">By <span className="font-medium">{agent.author}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{agent.description}</p>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {agent.rating > 0 ? (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < agent.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                            {agent.rating}({agent.reviews})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">★ No reviews yet</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">{agent.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}