"use client";

import { useEffect, useState } from "react";
import { CannedResponse } from "@/lib/interfaces";
import { cannedResponsesService } from "@/lib/api/services/canned-responses";
import { Loader2 } from "lucide-react";

interface CannedResponsesDropdownProps {
  filter: string;
  onSelect: (response: CannedResponse) => void;
  onClose: () => void;
}

export default function CannedResponsesDropdown({
  filter,
  onSelect,
  onClose,
}: CannedResponsesDropdownProps) {
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch canned responses when component mounts
  useEffect(() => {
    fetchCannedResponses();
  }, []);

  const fetchCannedResponses = async () => {
    try {
      setLoading(true);
      const response = await cannedResponsesService.getCannedResponses();
      if (response.status === "OK") {
        setCannedResponses(response.data);
      }
    } catch (error) {
      console.error("Error fetching canned responses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter canned responses based on text after /
  const filteredResponses = cannedResponses.filter((response) =>
    response.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Canned Responses
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Loading responses...
            </span>
          </div>
        ) : filteredResponses.length > 0 ? (
          <ul className="space-y-1">
            {filteredResponses.map((response) => (
              <li
                key={response.id}
                className="px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onSelect(response)}
              >
                <div className="font-medium">{response.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {response.message}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
            No matching responses found
          </p>
        )}
      </div>
    </div>
  );
}
