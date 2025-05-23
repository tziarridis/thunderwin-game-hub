import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { KycRequest, KycStatusEnum } from '@/types';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';

const KycManagement = () => {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for KYC requests
    const mockRequests: KycRequest[] = [
      {
        id: '1',
        user_id: 'user1',
        document_type: 'passport',
        document_front_url: 'https://example.com/passport1_front.jpg',
        document_back_url: 'https://example.com/passport1_back.jpg',
        status: KycStatusEnum.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'user2',
        document_type: 'national_id',
        document_front_url: 'https://example.com/national_id2_front.jpg',
        document_back_url: 'https://example.com/national_id2_back.jpg',
        status: KycStatusEnum.APPROVED,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        user_id: 'user3',
        document_type: 'drivers_license',
        document_front_url: 'https://example.com/drivers_license3_front.jpg',
        document_back_url: 'https://example.com/drivers_license3_back.jpg',
        status: KycStatusEnum.REJECTED,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: '4',
        user_id: 'user4',
        document_type: 'passport',
        document_front_url: 'https://example.com/passport4_front.jpg',
        document_back_url: 'https://example.com/passport4_back.jpg',
        status: KycStatusEnum.RESUBMIT_REQUIRED,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setRequests(mockRequests);
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: KycStatusEnum) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, status: newStatus, updated_at: new Date().toISOString() } : req
    ));
    toast.success(`KYC request ${requestId} status updated to ${newStatus}`);
    setLoading(false);
  };

  const handleCopyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.success('User ID copied to clipboard!');
  };

  const handleDeleteRequest = async (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteRequest = async () => {
    if (selectedRequestId) {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequests(requests.filter(req => req.id !== selectedRequestId));
      toast.success(`KYC request ${selectedRequestId} deleted successfully`);
      setIsDeleteAlertOpen(false);
      setSelectedRequestId(null);
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(request.user_id);

    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;

    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const requestDate = new Date(request.created_at);
      matchesDate = requestDate >= dateRange.from && requestDate <= dateRange.to;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search by user ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={KycStatusEnum.PENDING}>Pending</SelectItem>
            <SelectItem value={KycStatusEnum.APPROVED}>Approved</SelectItem>
            <SelectItem value={KycStatusEnum.REJECTED}>Rejected</SelectItem>
            <SelectItem value={KycStatusEnum.RESUBMIT_REQUIRED}>Resubmission Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">ID</TableHead>
              <TableHead className="px-6 py-3">User ID</TableHead>
              <TableHead className="px-6 py-3">Document Type</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Created At</TableHead>
              <TableHead className="px-6 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {request.id}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap dark:text-white">
                  <div className="flex items-center gap-2">
                    {request.user_id}
                    <Button variant="ghost" size="icon" onClick={() => handleCopyUserId(request.user_id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap dark:text-white">
                  {request.document_type}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap dark:text-white">
                  {request.status && (
                    <KycStatusDisplay status={request.status as string} />
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap dark:text-white">
                  {format(new Date(request.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap dark:text-white">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteRequest(request.id)} className="text-destructive focus:text-destructive-foreground">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Select
                    value={request.status as string}
                    onValueChange={(value) => handleStatusChange(request.id, value as KycStatusEnum)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={KycStatusEnum.PENDING}>Pending</SelectItem>
                      <SelectItem value={KycStatusEnum.APPROVED}>Approved</SelectItem>
                      <SelectItem value={KycStatusEnum.REJECTED}>Rejected</SelectItem>
                      <SelectItem value={KycStatusEnum.RESUBMIT_REQUIRED}>Resubmit Required</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this KYC request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRequestId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={confirmDeleteRequest}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KycManagement;
