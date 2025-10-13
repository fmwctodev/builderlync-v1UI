import { Search, Star } from 'lucide-react';

export function AgentTemplates() {
  const agents = [
    {
      name: 'PetSafe',
      subtitle: 'PetSafe Ai',
      installs: '7.7K',
      author: 'CRM Pros',
      description: 'Life-saving guidance, just a click away.',
      rating: 0,
      price: 'Free'
    },
    {
      name: 'FrontDoor AI',
      subtitle: 'FrontDoor AI',
      installs: '6.2K',
      author: 'DELLWING ONLINE GmbH',
      description: 'AI Voice Receptionist that books appointments, qualifies leads & updates CRM automatically.',
      rating: 0,
      price: 'Free'
    },
    {
      name: 'Self Demoing Voice AI Agent Rachel',
      subtitle: '#1 AI Sales, Receptionist & AfterHours Voice Agent',
      installs: '4.1K',
      author: 'Extendly',
      description: 'The #1 SaaS Self Demoing and Sales Agent, Receptionist and After Hours Agents',
      rating: 5,
      reviews: 1,
      price: 'Free'
    },
    {
      name: 'Justin',
      subtitle: 'Justin - Your Unbreakable Voice Assistant',
      installs: '2.6K',
      author: 'BeVisible Online Solutions Ltd.',
      description: 'An Unbreakable Voice Assistant Built for Service Businesses',
      rating: 0,
      price: 'Free'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Agency View</p>
        <p className="text-gray-600 dark:text-gray-400">
          Get more out of your CRM. Explore apps & integrate them with your account seamlessly.
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="px-4 py-2 bg-red-600 text-white rounded-md">All Apps</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Installed Apps</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">App Reselling</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">AI Agents</button>
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
              <span>Categories</span>
              <span>Use Cases</span>
              <span>Business Niche</span>
              <span>Pricing</span>
              <span>Actions</span>
              <span>Agent Contains</span>
              <span>Who can install the app?</span>
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